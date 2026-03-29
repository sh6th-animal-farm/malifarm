import { PriceUp, PriceDown } from '@/components/icon/Icons';
import type { Token } from '@/types/tokenType';

interface TokenRowProps {
  token: Token;
  index: number;
  isActive: boolean;
  onHover: (tokenId: number) => void;
  onClick: () => void;
}

export default function TokenListTableRow({
  token,
  index,
  isActive,
  onHover,
  onClick,
}: TokenRowProps) {
  const formatNum = (num: number) => new Intl.NumberFormat().format(num); // 천 단위 구분 쉼표 추가

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      const millionPart = Math.floor(vol / 1000000);
      const tenThousandPart = Math.floor((vol % 1000000) / 10000);
      return (
        <>
          {formatNum(millionPart)}백
          {tenThousandPart > 0 && ` ${tenThousandPart}만`}
        </>
      );
    }
    return formatNum(vol);
  };

  const isPlus = token.changeRate > 0;

  return (
    <tr
      onMouseOver={() => onHover(token.tokenId)}
      onClick={onClick}
      className={`
        flex items-center w-full py-4 px-2 border-bottom border-gray-50 cursor-pointer transition-colors duration-500
        ${isActive ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
      `}
    >
      {/* 순위 */}
      <td className="w-[80px] text-center text-gray-900 font-body-01">
        {index + 1}
      </td>

      {/* 종목 */}
      <td className="flex-1 min-w-[150px] text-left">
        <div className="text-gray-900 font-body-03">{token.tokenName}</div>
        <div className="text-gray-400 uppercase font-caption-01">
          {token.tickerSymbol}
        </div>
      </td>

      {/* 현재가 */}
      <td className="w-[160px] text-right">
        <div className="text-gray-900 font-body-03">
          {formatNum(token.marketPrice)}
        </div>
      </td>

      {/* 등락률 */}
      <td
        className={`w-[160px] font-body-03 ${isPlus ? 'text-error' : 'text-info'}`}
      >
        <div className="flex items-center justify-end gap-1 w-full">
          <span className="flex items-center">
            {isPlus ? <PriceUp /> : <PriceDown />}
          </span>
          <span className="font-semibold">{token.changeRate.toFixed(2)}%</span>
        </div>
      </td>

      {/* 거래대금 */}
      <td className="w-[180px] pr-6 text-right text-gray-900 font-body-01">
        {formatVolume(token.dailyTradeVolume)}
      </td>
    </tr>
  );
}
