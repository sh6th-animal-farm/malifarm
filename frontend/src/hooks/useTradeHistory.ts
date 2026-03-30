import { useEffect, useState, useCallback } from 'react';
import WebSocketManager from '@/utils/WebSocketManager';
import type { TradeInfo } from '@/types/tokenType';

export const useTradeHistory = (
  tokenId: string | number | undefined,
  initialTrades: TradeInfo[] = []
) => {
  const [trades, setTrades] = useState<TradeInfo[]>([]);

  // 1. 초기 데이터 주입 (API -> State)
  useEffect(() => {
    // tokenId가 없으면 바로 종료
    if (!tokenId) return;

    setTrades(initialTrades);
  }, [initialTrades]);

  // 2. 실시간 체결 데이터 추가 로직
  const updateTradeHistory = useCallback((data: TradeInfo) => {
    setTrades((prev) => {
      const newList = [data, ...prev]; // 새로운 체결을 맨 앞에 추가
      return newList.slice(0, 50); // 최신 50개만 유지
    });
  }, []);

  useEffect(() => {
    if (!tokenId) return;

    const url = import.meta.env.VITE_WS_URL;
    const topic = `/topic/trades/${tokenId}`;
    const subId = `trade-${tokenId}`;

    WebSocketManager.connect(url, () => {
      WebSocketManager.subscribe(subId, topic, (data: TradeInfo) => {
        console.log('[WebSocket - 체결]', data);
        updateTradeHistory(data);
      });
    });

    return () => {
      WebSocketManager.unsubscribe(subId);
    };
  }, [tokenId, updateTradeHistory]);

  return { trades };
};