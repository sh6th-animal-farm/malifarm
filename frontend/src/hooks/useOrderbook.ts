import { useEffect, useState, useCallback } from 'react';
import WebSocketManager from '@/utils/WebSocketManager.ts';
import type { LiveOrderInfo, OrderInfo } from '@/types/tokenType.ts';

export const useOrderbook = (
  tokenId: string | number | undefined,
  initialBuys: OrderInfo[] = [],
  initialSells: OrderInfo[] = []
) => {
  const [buys, setBuys] = useState<Record<string, number>>({}); // <가격, 수량>
  const [sells, setSells] = useState<Record<string, number>>({}); // <가격, 수량>

  // 1. API로 가져온 초기 리스트가 바뀔 때(토큰 변경 시 등) 상태 초기화
  useEffect(() => {
    // tokenId가 없으면 바로 종료
    if (!tokenId) return;

    const b: Record<string, number> = {};
    const s: Record<string, number> = {};
    initialBuys.forEach(item => b[item.price.toString()] = Number(item.totalVolume));
    initialSells.forEach(item => s[item.price.toString()] = Number(item.totalVolume));
    setBuys(b);
    setSells(s);
  }, [initialBuys, initialSells]);

  const updateOrderbook = useCallback((data: LiveOrderInfo) => {
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
  }, []);

  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL;
    const topic = `/topic/orders/${tokenId}`;
    const subId = `orderbook-${tokenId}`;

    WebSocketManager.connect(url, () => {
      WebSocketManager.subscribe(subId, topic, (data) => {
        console.log('[WebSocket - 호가]', data);
        updateOrderbook(data);
      });
    });

    return () => WebSocketManager.unsubscribe(subId);
  }, [tokenId, updateOrderbook]);

  // OrderInfo 타입으로 반환
  const sortedBuys: OrderInfo[] = Object.entries(buys)
    .map(([p, v]) => ({
      price: p,
      totalVolume: v.toString(), // 필드명 맞춤 (totalVolume)
      side: 'BUY' as const       // 타입 추론을 위해 as const 사용
    }))
    .sort((a, b) => Number(b.price) - Number(a.price));

  const sortedSells: OrderInfo[] = Object.entries(sells)
    .map(([p, v]) => ({
      price: p,
      totalVolume: v.toString(),
      side: 'SELL' as const
    }))
    .sort((a, b) => Number(a.price) - Number(b.price));

  return { sortedBuys, sortedSells };
};