import type { TradeInfo } from '@/types/tokenType';

interface MobileTokenExecutionCardProps {
  tradeList: TradeInfo[];
}

export default function MobileTokenExecutionCard({
  tradeList,
}: MobileTokenExecutionCardProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
            return (
              <tr key={idx} className="h-10">
                <td className="py-3 pl-4 font-body-03">
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
              <td colSpan={3} className="py-20 text-center text-gray-400 font-body-01">
                체결 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

