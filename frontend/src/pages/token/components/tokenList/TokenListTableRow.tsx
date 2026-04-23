import { PriceUp, PriceDown } from '@/components/icon/Icons';
import type { Token } from '@/types/tokenType';
import { useEffect, useRef, useState } from 'react';

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
  const [flashClass, setFlashClass] = useState('');
  const prevRateRef = useRef(token.changeRate);

  // 등락률 변화 시, 깜빡임 효과
  useEffect(() => {
    if (prevRateRef.current !== token.changeRate) {
      if (token.changeRate > 0) {
        setFlashClass('bg-error-light');
      } else if (token.changeRate < 0) {
        setFlashClass('bg-info-light');
      }

      // 0.5초 후 배경색 제거
      const timer = setTimeout(() => setFlashClass(''), 500);

      // 변화된 등락률 업데이트
      prevRateRef.current = token.changeRate;
      return () => clearTimeout(timer);
    }
  }, [token.changeRate]);

  // 천 단위 구분 쉼표 추가
  const formatNum = (num: number) => new Intl.NumberFormat().format(num);

  // 거래대금이 백만 이상일 때, 'O백 O만'으로 수정
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

  return (
    <tr
      onMouseOver={() => onHover(token.tokenId)}
      onClick={onClick}
      className={`
        flex items-center w-full py-4 border-bottom border-gray-50 cursor-pointer transition-colors duration-500 numeric-fixed
        ${isActive ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
      `}
    >
      {/* 순위 */}
      <td className="w-[50px] lg:w-[80px] text-center text-gray-900 font-body-01">
        {index + 1}
      </td>

      {/* 종목 */}
      <td className="flex-1 lg:min-w-[150px] text-left px-2">
        <div className="text-gray-900 font-body-03">{token.tokenName}</div>
        <div className="text-gray-400 uppercase font-caption-01">
          {token.tickerSymbol}
        </div>
      </td>

      {/* 현재가 */}
      <td className="w-[100px] lg:w-[160px] text-right px-2">
        <div className="text-gray-900 font-body-03">
          {formatNum(token.marketPrice)}
        </div>
      </td>

      {/* 등락률 */}
      <td className="hidden lg:block lg:w-[180px] text-right shrink-0">
        <div className="flex justify-end">
          <div
            className={`
            flex items-center justify-end gap-1 px-3 py-1
            rounded-[var(--radius-s)] transition-colors duration-500 ease-out
            ${flashClass} 
          `}
          >
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
        </div>
      </td>

      {/* 거래대금 */}
      <td className="hidden lg:block lg:w-[160px] pr-6 text-right text-gray-900 font-body-01 shrink-0">
        {formatVolume(token.dailyTradeVolume)}
      </td>
    </tr>
  );
}
