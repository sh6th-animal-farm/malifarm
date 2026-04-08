import { useEffect, useCallback } from 'react';
import { tokenApi } from '@/api/tokenApi';
import WebSocketManager from '@/utils/WebSocketManager';
import type { CandleStick } from '@/types/tokenType';
import type { ISeriesApi, UTCTimestamp } from 'lightweight-charts';

export const useTokenChart = (
  tokenId: string | number | undefined,
  activeUnit: string | number,
  candleSeriesRef: React.MutableRefObject<ISeriesApi<'Candlestick'> | null>,
  volumeSeriesRef: React.MutableRefObject<ISeriesApi<'Histogram'> | null>,
  isReady: boolean,
) => {
  const KST_OFFSET = 9 * 60 * 60; // 9시간 (초 단위)

  // 실시간 캔들 업데이트
  const updateCandle = useCallback(
    (data: CandleStick) => {
      if (!candleSeriesRef.current) {
        return;
      }

      const {
        candleTime,
        openingPrice,
        highPrice,
        lowPrice,
        closingPrice,
        tradeVolume,
      } = data;

      const rawTime = Number(candleTime); // 시간을 문자열에서 숫자로 변환
      const timeValue =
        rawTime > 10000000000 ? Math.floor(rawTime / 1000) : rawTime; // 만약 데이터가 밀리초(13자리)라면 초로 변환
      const finalTime = (timeValue + KST_OFFSET) as UTCTimestamp; // 한국 시간으로 보정

      // 차트 인스턴스에서 직접 마지막 데이터의 시간을 가져오는 게 가장 정확합니다.
      const lastData = (candleSeriesRef.current as any)._internal_series
        ?.data()
        .last();
      const lastTime = lastData ? lastData.time : 0;

      // 새 데이터의 시간이 마지막 데이터 시간보다 작으면(과거라면) 업데이트하지 않음
      if (finalTime < lastTime) return;

      // 캔들 업데이트
      candleSeriesRef.current.update({
        time: finalTime,
        open: Number(openingPrice),
        high: Number(highPrice),
        low: Number(lowPrice),
        close: Number(closingPrice),
      });

      // 거래량이 있는 경우에만 업데이트
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.update({
          time: finalTime,
          value: Number(tradeVolume || 0),
          color:
            Number(closingPrice) >= Number(openingPrice)
              ? '#ffebee'
              : '#e8f1fa',
        });
      }
    },
    [candleSeriesRef, volumeSeriesRef],
  );

  // 초기 데이터 로드 및 웹소켓 연결
  useEffect(() => {
    let currentSubId: string | undefined;

    const fetchAndSubscribe = async () => {
      // tokenId와 candleSeries가 존재할 때만 실행
      if (!tokenId || !candleSeriesRef.current) return;

      try {
        // 이전 단위 데이터 삭제
        candleSeriesRef.current?.setData([]);
        volumeSeriesRef.current?.setData([]);

        // 과거 데이터 로드
        const response = await tokenApi.getCandles(
          Number(tokenId),
          Number(activeUnit),
        );

        const candleData = response.map((d: CandleStick) => ({
          time: (Number(d.candleTime) + KST_OFFSET) as UTCTimestamp,
          open: Number(d.openingPrice),
          high: Number(d.highPrice),
          low: Number(d.lowPrice),
          close: Number(d.closingPrice),
        }));

        candleSeriesRef.current.setData(candleData);

        if (volumeSeriesRef.current) {
          const volumeData = response.map((d: CandleStick) => ({
            time: (Number(d.candleTime) + KST_OFFSET) as UTCTimestamp,
            value: Number(d.tradeVolume || 0),
            color:
              Number(d.closingPrice) >= Number(d.openingPrice)
                ? '#ffebee'
                : '#e8f1fa',
          }));

          volumeSeriesRef.current.setData(volumeData);
        }

        // 웹소켓 실시간 구독
        const url = import.meta.env.VITE_WS_URL;
        const topic = `/topic/candles/${tokenId}/${activeUnit}`;
        const subId = `candle-${tokenId}/${activeUnit}`;

        WebSocketManager.connect(url, () => {
          WebSocketManager.subscribe(subId, topic, (data) => {
            console.log(`[WebSocket - 캔들(${activeUnit})]`, data);
            updateCandle(data);
          });
        });

        return subId;
      } catch (error) {
        console.error('차트 데이터 로드 실패:', error);
      }
    };

    fetchAndSubscribe().then((id) => (currentSubId = id));

    return () => {
      if (currentSubId) WebSocketManager.unsubscribe(currentSubId);
    };
  }, [tokenId, activeUnit, updateCandle, isReady]);
};
