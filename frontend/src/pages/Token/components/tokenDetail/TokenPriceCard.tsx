import { useState, useMemo } from 'react';
import ToggleGroup from '@/components/common/ToggleGroup';
import type { OrderInfo, TokenOhlcv, TradeInfo } from '@/types/tokenType';

interface TokenPriceCardProps {
  ohlcv: TokenOhlcv | null;
  buyList: OrderInfo[];
  sellList: OrderInfo[];
  tradeList: TradeInfo[];
  onPriceClick: (price: number) => void;
  mobileCombined?: boolean;
  embedded?: boolean;
}

export default function TokenPriceCard({
  ohlcv,
  buyList,
  sellList,
  tradeList,
  onPriceClick,
  mobileCombined = false,
  embedded = false,
}: TokenPriceCardProps) {
  const [activeTab, setActiveTab] = useState('order');
  const tabs = [
    { id: 'order', label: '호가' },
    { id: 'trade', label: '체결' },
  ];

  // 1. 호가 단위(Tick Size) 계산
  const getTickSize = (price: number) => {
    if (price < 10) return 0.01;
    if (price < 100) return 0.1;
    if (price < 1000) return 1;
    if (price < 10000) return 5;
    if (price < 100000) return 10;
    if (price < 500000) return 50;
    return 100;
  };

  // 2. 호가 사다리(Ladder) 생성 (Memoization)
  const ladder = useMemo(() => {
    if (!ohlcv) return [];

    const marketPrice = Number(ohlcv.marketPrice);
    const tickSize = getTickSize(marketPrice);
    const basePrice = Math.round(marketPrice / tickSize) * tickSize; // 현재가를 호가 단위에 맞춰 보정

    const sellMap = new Map<number, number>(); // <가격, 수량>
    sellList.forEach((s) => {
      const priceNum = Number(s.price);
      sellMap.set(
        priceNum,
        (sellMap.get(priceNum) || 0) + Number(s.totalVolume),
      );
    });

    const buyMap = new Map<number, number>(); // <가격, 수량>
    buyList.forEach((b) => {
      const priceNum = Number(b.price);
      buyMap.set(priceNum, (buyMap.get(priceNum) || 0) + Number(b.totalVolume));
    });

    const rows = [];

    // 1. 매도 10개 (위로)
    for (let i = 10; i >= 1; i--) {
      const p = basePrice + i * tickSize;
      rows.push({
        price: p,
        volume: sellMap.get(p) || 0,
        side: 'SELL',
        isCurrent: false,
      });
    }

    // 2. 현재가
    const sVol = sellMap.get(basePrice) || 0;
    const bVol = buyMap.get(basePrice) || 0;

    rows.push({
      price: basePrice,
      volume: sVol > 0 ? sVol : bVol,
      side: sVol > 0 ? 'SELL' : 'BUY',
      isCurrent: true,
    });

    // 3. 매수 10개 (아래로)
    for (let i = 1; i <= 10; i++) {
      const p = basePrice - i * tickSize;
      rows.push({
        price: p,
        volume: buyMap.get(p) || 0,
        side: 'BUY',
        isCurrent: false,
      });
    }

    const maxVol = Math.max(...rows.map((r) => r.volume), 0.0001);
    return rows.map((r) => ({ ...r, ratio: (r.volume / maxVol) * 100 }));
  }, [ohlcv, buyList, sellList]);

  if (!ohlcv)
    return (
      <div
        className={`${mobileCombined ? 'h-full' : 'h-[760px]'} w-full md:w-[420px] animate-pulse bg-gray-50 rounded-[var(--radius-m)]`}
      />
    );

  if (mobileCombined) {
    return (
      <div
        className={`flex h-full flex-col gap-3 overflow-hidden ${embedded ? 'bg-transparent p-3' : 'bg-white border border-gray-100 rounded-[var(--radius-m)] shadow-std p-4'}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="font-body-03 text-gray-900">호가</span>
          <span className="font-caption-02 text-gray-400">수량</span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-1">
            {ladder.map((row, idx) => {
              const isSell = row.side === 'SELL';
              return (
                <button
                  key={idx}
                  onClick={() => onPriceClick(row.price)}
                  className="relative flex h-8 w-full items-center justify-between rounded-[var(--radius-s)] px-2 text-left hover:bg-gray-50"
                >
                  <span
                    className={`z-10 font-caption-02 ${isSell ? 'text-info' : 'text-error'}`}
                  >
                    {row.price.toLocaleString()}
                  </span>
                  <span className="z-10 font-caption-01 text-gray-600">
                    {row.volume > 0 ? Number(row.volume).toFixed(4) : '-'}
                  </span>
                  <div
                    className={`absolute right-2 top-1/2 h-5 -translate-y-1/2 rounded-[var(--radius-s)] ${isSell ? 'bg-info-light' : 'bg-error-light'}`}
                    style={{ width: `${Math.max(row.ratio, 6)}%` }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-[var(--radius-m)] shadow-std flex flex-col gap-4 p-4 md:p-6 h-[760px] w-full md:w-[420px] overflow-hidden">
      {/* 호가/체결 탭 */}
      <ToggleGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        height={52}
        fullWidth
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === 'order' ? (
          <table className="w-full table-fixed border-collapse select-none">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="p-2 font-caption-02">매도잔량</th>
                <th className="p-2 font-caption-02">가격</th>
                <th className="p-2 font-caption-02">매수잔량</th>
              </tr>
            </thead>
            <tbody>
              {ladder.map((row, idx) => {
                const priceColor =
                  row.side === 'SELL' ? 'text-info' : 'text-error';

                return (
                  <tr key={idx} className={'h-10'}>
                    {/* 매도 물량 바 */}
                    <td className="relative py-3 text-right text-[12px] font-medium text-gray-500">
                      {row.side === 'SELL' && row.volume > 0 && (
                        <>
                          <div
                            className="absolute right-0 top-1 bottom-1 bg-info-light rounded-l-[var(--radius-s)] transition-all duration-500"
                            style={{ width: `${row.ratio}%`, zIndex: 1 }}
                          />
                          <span className="relative z-10 pr-1">
                            {Number(row.volume).toFixed(4)}
                          </span>
                        </>
                      )}
                    </td>

                    {/* 가격 */}
                    <td
                      onClick={() => onPriceClick(row.price)}
                      className={`py-3 text-center font-body-03 hover:bg-gray-50 transition-colors cursor-pointer ${priceColor} ${row.isCurrent ? 'border-2 border-[${priceColor}]' : ''}`}
                    >
                      {row.price?.toLocaleString()}
                    </td>

                    {/* 매수 물량 바 */}
                    <td className="relative py-3 text-left text-[12px] font-medium text-gray-500">
                      {row.side === 'BUY' && row.volume > 0 && (
                        <>
                          <div
                            className="absolute left-0 top-1 bottom-1 bg-error-light rounded-r-[var(--radius-s)] transition-all duration-500"
                            style={{ width: `${row.ratio}%` }}
                          />
                          <span className="relative z-10 pl-1">
                            {Number(row.volume).toFixed(4)}
                          </span>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="py-2 pl-4 text-left font-caption-02">구분</th>
                <th className="py-2 text-right font-caption-02">가격</th>
                <th className="py-2 pr-4 text-right font-caption-02">수량</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tradeList.map((trade, idx) => {
                const isSell = trade.takerSide === 'SELL';
                // createdAt에서 시간 부분만 추출 (예: 14:20:05)
                // const timeStr = new Date(trade.createdAt).toLocaleTimeString(
                //   'ko-KR',
                //   { hour12: false },
                // );

                return (
                  <tr key={idx} className="h-10">
                    <td className="py-3 pl-4 font-body-03">
                      {/* 
                      <span className="text-gray-400 mr-2 text-[10px]">
                        {timeStr}
                      </span> 
                      */}
                      <span className={isSell ? 'text-info' : 'text-error'}>
                        {isSell ? '매도' : '매수'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-body-03 text-gray-900">
                      {Number(trade.price).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-right font-body-02 text-gray-400">
                      {Number(trade.volume).toFixed(4)}
                    </td>
                  </tr>
                );
              })}
              {tradeList.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-20 text-center text-gray-400 font-body-01"
                  >
                    체결 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
