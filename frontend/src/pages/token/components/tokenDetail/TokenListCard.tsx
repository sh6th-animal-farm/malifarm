import { PriceUp, PriceDown } from '@/components/icon/Icons';
import type { Token } from '@/types/tokenType';

interface TokenListCardProps {
  tokenList: Token[];
  onTokenClick?: (tokenId: number) => void;
  activeTokenId?: number;
}

export default function TokenListCard({
  tokenList,
  onTokenClick,
  activeTokenId,
}: TokenListCardProps) {
  return (
    <div className="bg-white rounded-[var(--radius-m)] shadow-std overflow-hidden">
      <div className="overflow-y-auto max-h-[600px] scrollbar-hide">
        <table className="w-full border-collapse text-left font-body-03 numeric-fixed">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th className="pl-6 font-body-02 text-gray-400">
                종목
              </th>
              <th className="p-4 font-body-02 text-gray-400 text-right">
                현재가
              </th>
              <th className="pr-6 font-body-02 text-gray-400 text-right">
                등락률
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {tokenList.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">🔍</span>
                    <p className="text-gray-400 font-body-02">조회된 토큰이 없습니다.</p>
                  </div>
                </td>
              </tr>
            ) : (
              tokenList.map((token) => (
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
                  <td className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {token.changeRate > 0 && <PriceUp />}
                      {token.changeRate < 0 && <PriceDown />}
                      <span
                        className={`
                         font-body-03
                        ${
                          token.changeRate > 0
                            ? 'text-error'
                            : token.changeRate < 0
                              ? 'text-info'
                              : 'text-gray-900'
                        }
                      `}
                      >
                        {token.changeRate.toFixed(2) || '0.00'}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
