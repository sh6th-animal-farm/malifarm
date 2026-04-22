import { useMemo } from 'react';
import type { OrderInfo, TokenOhlcv } from '@/types/tokenType';

export interface OrderbookLadderRow {
  price: number;
  volume: number;
  side: 'SELL' | 'BUY';
  isCurrent: boolean;
  ratio: number;
}

const getTickSize = (price: number) => {
  if (price < 10) return 0.01;
  if (price < 100) return 0.1;
  if (price < 1000) return 1;
  if (price < 10000) return 5;
  if (price < 100000) return 10;
  if (price < 500000) return 50;
  return 100;
};

interface UseOrderbookLadderParams {
  ohlcv: TokenOhlcv | null;
  buyList: OrderInfo[];
  sellList: OrderInfo[];
  depth?: number;
}

export const useOrderbookLadder = ({
  ohlcv,
  buyList,
  sellList,
  depth = 10,
}: UseOrderbookLadderParams) => {
  return useMemo<OrderbookLadderRow[]>(() => {
    if (!ohlcv) return [];

    const marketPrice = Number(ohlcv.marketPrice);
    const tickSize = getTickSize(marketPrice);
    const basePrice = Math.round(marketPrice / tickSize) * tickSize;

    const sellMap = new Map<number, number>();
    sellList.forEach((sell) => {
      const price = Number(sell.price);
      sellMap.set(price, (sellMap.get(price) || 0) + Number(sell.totalVolume));
    });

    const buyMap = new Map<number, number>();
    buyList.forEach((buy) => {
      const price = Number(buy.price);
      buyMap.set(price, (buyMap.get(price) || 0) + Number(buy.totalVolume));
    });

    const rows: Omit<OrderbookLadderRow, 'ratio'>[] = [];

    for (let i = depth; i >= 1; i--) {
      const price = basePrice + i * tickSize;
      rows.push({
        price,
        volume: sellMap.get(price) || 0,
        side: 'SELL',
        isCurrent: false,
      });
    }

    const sellAtBase = sellMap.get(basePrice) || 0;
    const buyAtBase = buyMap.get(basePrice) || 0;
    rows.push({
      price: basePrice,
      volume: sellAtBase > 0 ? sellAtBase : buyAtBase,
      side: sellAtBase > 0 ? 'SELL' : 'BUY',
      isCurrent: true,
    });

    for (let i = 1; i <= depth; i++) {
      const price = basePrice - i * tickSize;
      rows.push({
        price,
        volume: buyMap.get(price) || 0,
        side: 'BUY',
        isCurrent: false,
      });
    }

    const maxVolume = Math.max(...rows.map((row) => row.volume), 0.0001);
    return rows.map((row) => ({
      ...row,
      ratio: (row.volume / maxVolume) * 100,
    }));
  }, [ohlcv, buyList, sellList, depth]);
};

