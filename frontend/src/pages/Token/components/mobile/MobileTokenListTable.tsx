import type { Token } from '@/types/tokenType';
import { useNavigate } from 'react-router';
import { PriceDown, PriceUp } from '@/components/icon/Icons';

interface MobileTokenListTableProps {
  tokenList: Token[];
  hoveredTokenId: number | null;
  onHover: (id: number) => void;
}

export default function MobileTokenListTable({
  tokenList,
  hoveredTokenId,
  onHover,
}: MobileTokenListTableProps) {
  const navigate = useNavigate();
  const formatNum = (num: number) => new Intl.NumberFormat().format(num);

  return (
    <div>
      <table className="w-full border-separate border-spacing-0">
        <tbody className="block w-full">
          {tokenList.length > 0 ? (
            tokenList.map((token, index) => {
              const isUp = token.changeRate > 0;
              const isDown = token.changeRate < 0;

              return (
                <tr
                  key={token.tokenId}
                  onMouseOver={() => onHover(token.tokenId)}
                  onClick={() => navigate(`/token/${token.tokenId}`)}
                  className={`
                    flex items-center w-full px-4 py-3 border-bottom border-gray-50 cursor-pointer transition-colors duration-500
                    ${
                      hoveredTokenId === token.tokenId
                        ? 'bg-gray-50'
                        : 'bg-white hover:bg-gray-50'
                    }
                  `}
                >
                  <td className="w-[32px] text-center text-gray-900 font-body-01">
                    {index + 1}
                  </td>

                  <td className="flex-1 min-w-0 text-left px-2">
                    <div className="text-gray-900 font-body-03">
                      {token.tokenName}
                    </div>
                    <div className="text-gray-400 uppercase font-caption-01">
                      {token.tickerSymbol}
                    </div>
                  </td>

                  <td className="w-[132px] text-right px-2">
                    <div className="text-gray-900 font-body-03">
                      {formatNum(token.marketPrice)}원
                    </div>
                    <div className="mt-0.5 flex items-center justify-end gap-0.5">
                      {isUp && <PriceUp />}
                      {isDown && <PriceDown />}
                      <span
                        className={`font-caption-02 ${
                          isUp
                            ? 'text-error'
                            : isDown
                              ? 'text-info'
                              : 'text-gray-900'
                        }`}
                      >
                        {token.changeRate.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="flex items-center justify-center w-full min-h-[400px]">
              <td className="text-gray-400 font-body-01">
                데이터를 불러오는 중입니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
