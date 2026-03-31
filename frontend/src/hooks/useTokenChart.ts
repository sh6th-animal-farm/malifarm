import { useEffect, useCallback } from 'react';
import { tokenApi } from '@/api/tokenApi';
import WebSocketManager from '@/utils/WebSocketManager';
import type { CandleStick } from '@/types/tokenType';
import { type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';

export const useChart = (
  tokenId: string | number | undefined,
  activeUnit: string | number,
  candleSeriesRef: React.MutableRefObject<ISeriesApi<'Candlestick'> | null>,
  volumeSeriesRef: React.MutableRefObject<ISeriesApi<'Histogram'> | null>,
) => {
  const KST_OFFSET = 9 * 60 * 60; // 9시간 (초 단위)

  // 실시간 캔들 업데이트
  const updateCandle = useCallback(
    (data: CandleStick) => {
      if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

      const {
        tokenId,
        unit,
        candleTime,
        openingPrice,
        highPrice,
        lowPrice,
        closingPrice,
        tradeVolume,
        tradeAmount,
      } = data;

      // 한국 시간으로 보정
      const time = (Number(candleTime) + KST_OFFSET) as UTCTimestamp;

      // 캔들 업데이트
      candleSeriesRef.current.update({
        time,
        open: Number(openingPrice),
        high: Number(highPrice),
        low: Number(lowPrice),
        close: Number(closingPrice),
      });

      // 거래량 업데이트
      volumeSeriesRef.current.update({
        time,
        value: Number(tradeVolume || 0),
        color:
          Number(closingPrice) >= Number(openingPrice) ? '#ffebee' : '#e8f1fa',
      });
    },
    [candleSeriesRef, volumeSeriesRef],
  );

  // 초기 데이터 로드 및 웹소켓 연결
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      if (!tokenId || !candleSeriesRef.current || !volumeSeriesRef.current)
        return;

      try {
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

        const volumeData = response.map((d: CandleStick) => ({
          time: (Number(d.candleTime) + KST_OFFSET) as UTCTimestamp,
          value: Number(d.tradeVolume || 0),
          color:
            Number(d.closingPrice) >= Number(d.openingPrice)
              ? '#ffebee'
              : '#e8f1fa',
        }));

        candleSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        // 웹소켓 실시간 구독
        const url = import.meta.env.VITE_WS_URL;
        const topic = `/topic/candles/${tokenId}`;
        const subId = `candle-${tokenId}/${activeUnit}`;

        WebSocketManager.connect(url, () => {
          WebSocketManager.subscribe(subId, topic, (data) => {
            console.log('[WebSocket - 캔들]', data);
            updateCandle(data);
          });
        });

        return subId;
      } catch (error) {
        console.error('차트 데이터 로드 실패:', error);
      }
    };

    let currentSubId: string | undefined;
    fetchAndSubscribe().then((id) => (currentSubId = id));

    return () => {
      if (currentSubId) WebSocketManager.unsubscribe(currentSubId);
    };
  }, [tokenId, activeUnit, updateCandle]);
};
