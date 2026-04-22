import { useEffect, useState } from 'react';
import WebSocketManager from '@/utils/WebSocketManager';
import type { TradeInfo } from '@/types/tokenType';
import { tokenApi } from '@/api/tokenApi';

export const useTradeHistory = (tokenId: string | number | undefined) => {
  const [trades, setTrades] = useState<TradeInfo[]>([]);

  useEffect(() => {
    if (!tokenId) return;

    const fetchAndSubscribe = async () => {
      try {
        // 1. 초기 데이터 로드
        const tradeRes = await tokenApi.getTradeList(Number(tokenId));
        setTrades(tradeRes);

        // 2. 웹소켓 구독
        const url = import.meta.env.VITE_WS_URL;
        const topic = `/topic/trades/${tokenId}`;
        const subId = `tradehist-${tokenId}`;

        WebSocketManager.connect(url, () => {
          WebSocketManager.subscribe(subId, topic, (data: TradeInfo) => {
            console.log('[WebSocket - 체결]', data);
            setTrades((prev) => [data, ...prev].slice(0, 50));
          });
        });

        return subId;
      } catch (err) {
        console.error('체결 내역 로드 실패:', err);
      }
    };

    let currentSubId: string | undefined;
    fetchAndSubscribe().then((id) => (currentSubId = id));

    return () => {
      if (currentSubId) WebSocketManager.unsubscribe(currentSubId);
      setTrades([]);
    };
  }, [tokenId]);

  return { trades };
};
