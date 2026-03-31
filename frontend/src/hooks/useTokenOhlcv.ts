import { useEffect, useState } from 'react';
import { tokenApi } from '@/api/tokenApi';
import WebSocketManager from '@/utils/WebSocketManager';
import type { TokenOhlcv } from '@/types/tokenType';

export const useTokenOhlcv = (tokenId: string | number | undefined) => {
  const [tokenOhlcv, setTokenOhlcv] = useState<TokenOhlcv | null>(null);

  useEffect(() => {
    if (!tokenId) return;

    const fetchAndSubscribe = async () => {
      try {
        // 1. 초기 OHLCV 데이터 로드
        const initialData = await tokenApi.getOhlcv(Number(tokenId));
        setTokenOhlcv(initialData);

        // 2. 실시간 시세 업데이트 구독
        const url = import.meta.env.VITE_WS_URL;
        const topic = `/topic/tokenList/${tokenId}`;
        const subId = `ohlcv-${tokenId}`;

        WebSocketManager.connect(url, () => {
          WebSocketManager.subscribe(subId, topic, (data: TokenOhlcv) => {
            console.log('[WebSocket - OHLCV]', data);
            setTokenOhlcv(data);
          });
        });

        return subId;
      } catch (err) {
        console.error('OHLCV 로드 실패:', err);
      }
    };

    let currentSubId: string | undefined;
    fetchAndSubscribe().then((id) => (currentSubId = id));

    return () => {
      if (currentSubId) WebSocketManager.unsubscribe(currentSubId);
      setTokenOhlcv(null); // 토큰 변경 시 초기화
    };
  }, [tokenId]);

  return { tokenOhlcv };
};
