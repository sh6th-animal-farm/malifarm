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

      // 차트 인스턴스에서 직접 마지막 데이터의 시간을 가져오기
      const seriesData = candleSeriesRef.current.data();
      const lastTime =
        seriesData.length > 0
          ? (seriesData[seriesData.length - 1].time as number)
          : 0;

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
    [candleSeriesRef, volumeSeriesRef, activeUnit],
  );

  // 초기 데이터 로드 및 웹소켓 연결
  useEffect(() => {
    let currentSubId: string | undefined;

    const fetchAndSubscribe = async () => {
      // tokenId와 candleSeries가 존재할 때만 실행
      if (!tokenId || !candleSeriesRef.current || !isReady) return;

      try {
        // 1. 차트 초기화
        candleSeriesRef.current?.setData([]);
        volumeSeriesRef.current?.setData([]);

        // 2. 과거 데이터 로드
        const response = await tokenApi.getCandles(
          Number(tokenId),
          Number(activeUnit),
        );
        const unitSec = Number(activeUnit) * 60;

        // 3. 중복 시간 제거 및 데이터 정규화 (Map 활용)
        const normalizedMap = new Map<number, any>();

        response.forEach((d: CandleStick) => {
          const rawTime = Number(d.candleTime);
          const timeValue =
            rawTime > 10000000000 ? Math.floor(rawTime / 1000) : rawTime;

          // 시간을 유닛 단위로 내림 (예: 5분봉에서 12:01, 12:02 -> 모두 12:00으로 통합)
          const normTime = Math.floor(timeValue / unitSec) * unitSec;
          const finalTime = (normTime + KST_OFFSET) as UTCTimestamp;

          // Map은 키(시간)가 중복되면 마지막 값으로 덮어씌움 (중복 제거)
          normalizedMap.set(finalTime, {
            time: finalTime,
            open: Number(d.openingPrice),
            high: Number(d.highPrice),
            low: Number(d.lowPrice),
            close: Number(d.closingPrice),
            volume: Number(d.tradeVolume || 0),
          });
        });

        // 4. Map을 다시 배열로 변환하고 시간순으로 정렬
        const sortedData = Array.from(normalizedMap.values()).sort(
          (a, b) => a.time - b.time,
        );

        // 5. 차트 시리즈에 맞게 가공
        const candleData = sortedData.map((d) => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));

        const volumeData = sortedData.map((d) => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? '#ffebee' : '#e8f1fa',
        }));

        // 6. 데이터 설정
        candleSeriesRef.current.setData(candleData);
        if (volumeSeriesRef.current) {
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
