import { PriceUp, PriceDown } from '@/components/icon/Icons';
import type { TokenListItem } from '@/types/tokenType';

interface TokenListCardProps {
  tokenList: TokenListItem[];
  onTokenClick?: (tokenId: number) => void;
  activeTokenId?: number;
}

export default function TokenListCard({
  tokenList,
  onTokenClick,
  activeTokenId,
}: TokenListCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-[var(--radius-m)] shadow-std overflow-hidden">
      <div className="overflow-y-auto max-h-[600px] scrollbar-hide">
        <table className="w-full border-collapse text-left font-body-03">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="pl-6 font-body-02 text-gray-400 border-bottom border-gray-200">
                종목
              </th>
              <th className="p-4 font-body-02 text-gray-400 border-bottom border-gray-200 text-right">
                현재가
              </th>
              <th className="pr-6 font-body-02 text-gray-400 border-bottom border-gray-200 text-right">
                등락률
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tokenList.map((token) => {
              const isPositive = token.changeRate > 0;
              const rateColor = isPositive ? 'text-error' : 'text-info';

              return (
                <tr
                  key={token.tokenId}
                  onClick={() => onTokenClick?.(token.tokenId)}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 
                    ${activeTokenId === token.tokenId ? 'bg-gray-50' : ''}`}
                >
                  {/* 종목명 및 티커 */}
                  <td className="pl-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-body-03 text-gray-900">
                        {token.tokenName}
                      </span>
                      <span className="font-caption-02 text-gray-400">
                        {token.tickerSymbol}
                      </span>
                    </div>
                  </td>

                  {/* 현재가 */}
                  <td className="p-4 text-right font-body-03 text-gray-900">
                    {token.marketPrice?.toLocaleString()}
                  </td>

                  {/* 등락률 */}
                  <td className={`pr-6 text-right font-body-03 ${rateColor}`}>
                    <div className="flex items-center justify-end gap-0.5">
                      {isPositive ? <PriceUp /> : <PriceDown />}
                      {token.changeRate?.toFixed(2) || '0.00'}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
