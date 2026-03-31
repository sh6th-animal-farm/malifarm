import { useEffect, useState, useCallback } from 'react';
import WebSocketManager from '@/utils/WebSocketManager.ts';
import type { LiveOrderInfo, OrderInfo } from '@/types/tokenType.ts';
import { tokenApi } from '@/api/tokenApi';

export const useOrderbook = (tokenId: string | number | undefined) => {
  const [buys, setBuys] = useState<Record<string, number>>({}); // <가격, 수량>
  const [sells, setSells] = useState<Record<string, number>>({}); // <가격, 수량>

  // 초기 데이터 로드 및 웹소켓 구독 통합
  useEffect(() => {
    if (!tokenId) return;

    const fetchAndSubscribe = async () => {
      try {
        // 1. 초기 데이터 로드
        const [buyRes, sellRes] = await Promise.all([
          tokenApi.getBuyList(Number(tokenId)),
          tokenApi.getSellList(Number(tokenId)),
        ]);

        const b: Record<string, number> = {};
        const s: Record<string, number> = {};
        buyRes.forEach(
          (item) => (b[item.price.toString()] = Number(item.totalVolume)),
        );
        sellRes.forEach(
          (item) => (s[item.price.toString()] = Number(item.totalVolume)),
        );

        setBuys(b);
        setSells(s);

        // 2. 웹소켓 구독
        const url = import.meta.env.VITE_WS_URL;
        const topic = `/topic/orders/${tokenId}`;
        const subId = `orderbook-${tokenId}`;

        WebSocketManager.connect(url, () => {
          WebSocketManager.subscribe(subId, topic, (data: LiveOrderInfo) => {
            const { price, updatedVolume, side, action } = data;
            const isBuy = side === 'BUY';

            const updateState = (prev: Record<string, number>) => {
              const next = { ...prev };
              const priceKey = price.toString();
              if (action === 'DELETE' || Number(updatedVolume) <= 0) {
                delete next[priceKey];
              } else {
                next[priceKey] = Number(updatedVolume);
              }
              return next;
            };

            if (isBuy) setBuys(updateState);
            else setSells(updateState);
          });
        });

        return subId;
      } catch (err) {
        console.error('호가 로드 실패:', err);
      }
    };

    let currentSubId: string | undefined;
    fetchAndSubscribe().then((id) => (currentSubId = id));

    return () => {
      if (currentSubId) WebSocketManager.unsubscribe(currentSubId);
      // 토큰 ID 변경 시 초기화
      setBuys({});
      setSells({});
    };
  }, [tokenId]);

  // OrderInfo 타입으로 반환 및 정렬
  const buyList: OrderInfo[] = Object.entries(buys)
    .map(([p, v]) => ({
      price: p,
      totalVolume: v.toString(), // 필드명 맞춤 (totalVolume)
      side: 'BUY' as const, // 타입 추론을 위해 as const 사용
    }))
    .sort((a, b) => Number(b.price) - Number(a.price));

  const sellList: OrderInfo[] = Object.entries(sells)
    .map(([p, v]) => ({
      price: p,
      totalVolume: v.toString(),
      side: 'SELL' as const,
    }))
    .sort((a, b) => Number(a.price) - Number(b.price));

  return { buyList, sellList };
};
