import { useState } from 'react';
import ToggleGroup from '@/components/common/ToggleGroup';
import type { OrderInfo, TokenOhlcv, TradeInfo } from '@/types/tokenType';
import { useOrderbookLadder } from '@/pages/token/hooks/useOrderbookLadder';

interface TokenPriceCardProps {
  ohlcv: TokenOhlcv | null;
  buyList: OrderInfo[];
  sellList: OrderInfo[];
  tradeList: TradeInfo[];
  onPriceClick: (price: number) => void;
}

export default function TokenPriceCard({
  ohlcv,
  buyList,
  sellList,
  tradeList,
  onPriceClick,
}: TokenPriceCardProps) {
  const [activeTab, setActiveTab] = useState('order');
  const tabs = [
    { id: 'order', label: '호가' },
    { id: 'trade', label: '체결' },
  ];

  const ladder = useOrderbookLadder({ ohlcv, buyList, sellList });

  if (!ohlcv)
    return (
      <div className="h-[760px] w-[420px] animate-pulse bg-gray-50 rounded-[var(--radius-m)]" />
    );

  return (
    <div className="bg-white border border-gray-100 rounded-[var(--radius-m)] shadow-std flex flex-col gap-4 p-6 h-[760px] w-[420px] overflow-hidden">
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
