import { useEffect, useRef } from 'react';
import { useOrderbookLadder } from '@/pages/token/hooks/useOrderbookLadder';
import type { OrderInfo, TokenOhlcv } from '@/types/tokenType';

interface MobileTokenPriceCardProps {
  ohlcv: TokenOhlcv | null;
  buyList: OrderInfo[];
  sellList: OrderInfo[];
  onPriceClick: (price: number) => void;
}

export default function MobileTokenPriceCard({
  ohlcv,
  buyList,
  sellList,
  onPriceClick,
}: MobileTokenPriceCardProps) {
  const ladder = useOrderbookLadder({ ohlcv, buyList, sellList });
  const scrollRef = useRef<HTMLDivElement>(null);
  const focusedTokenIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!ohlcv || !scrollRef.current || ladder.length === 0) return;
    if (focusedTokenIdRef.current === ohlcv.tokenId) return;

    const container = scrollRef.current;
    const currentRow = container.querySelector<HTMLTableRowElement>(
      'tr[data-current-row="true"]',
    );
    if (!currentRow) return;

    const targetTop =
      currentRow.offsetTop - container.clientHeight / 2 + currentRow.clientHeight / 2;
    container.scrollTop = Math.max(0, targetTop);
    focusedTokenIdRef.current = ohlcv.tokenId;
  }, [ohlcv, ladder.length]);

  if (!ohlcv) {
    return <div className="-mx-4 h-full animate-pulse bg-gray-50" />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="grid grid-cols-3 border-b border-gray-100 bg-white text-gray-400">
        <span className="p-2 text-center font-caption-02">매도잔량</span>
        <span className="p-2 text-center font-caption-02">가격</span>
        <span className="p-2 text-center font-caption-02">매수잔량</span>
      </div>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 bg-white overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <table className="w-full table-fixed border-collapse select-none">
          <colgroup>
            <col style={{ width: '36%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '36%' }} />
          </colgroup>
          <tbody>
            {ladder.map((row, idx) => {
              const priceColor = row.side === 'SELL' ? 'text-info' : 'text-error';
              const priceBgClass =
                row.side === 'SELL' ? 'bg-info-light' : 'bg-error-light';
              const hasBottomDivider = idx !== ladder.length - 1;
              const isBuyStart =
                row.side === 'BUY' && idx > 0 && ladder[idx - 1].side !== 'BUY';

              return (
                <tr
                  key={idx}
                  data-current-row={row.isCurrent ? 'true' : undefined}
                  className={`h-9 ${isBuyStart ? 'border-t border-gray-100' : ''}`}
                >
                  <td className="relative py-2.5 text-right text-[12px] font-medium text-gray-500">
                    {row.side === 'SELL' ? (
                      row.volume > 0 ? (
                        <>
                          <div
                            className="absolute right-0 top-1 bottom-1 rounded-l-[var(--radius-s)] bg-info/20 transition-all duration-500"
                            style={{ width: `${row.ratio}%`, zIndex: 1 }}
                          />
                          <span className="relative z-10 pr-1">
                            {Number(row.volume).toFixed(4)}
                          </span>
                        </>
                      ) : (
                        <span className="relative z-10 pr-1">-</span>
                      )
                    ) : null}
                  </td>

                  <td
                    onClick={() => onPriceClick(row.price)}
                    className={`py-2.5 text-center font-body-03 transition-colors cursor-pointer ${priceColor} ${priceBgClass} ${hasBottomDivider ? 'border-b border-gray-100' : ''}`}
                    style={
                      row.isCurrent
                        ? {
                            boxShadow: `inset 0 0 0 2px ${
                              row.side === 'SELL'
                                ? 'var(--color-info)'
                                : 'var(--color-error)'
                            }`,
                          }
                        : undefined
                    }
                  >
                    {row.price.toLocaleString()}
                  </td>

                  <td className="relative py-2.5 text-left text-[12px] font-medium text-gray-500">
                    {row.side === 'BUY' ? (
                      row.volume > 0 ? (
                        <>
                          <div
                            className="absolute left-0 top-1 bottom-1 rounded-r-[var(--radius-s)] bg-error/20 transition-all duration-500"
                            style={{ width: `${row.ratio}%` }}
                          />
                          <span className="relative z-10 pl-1">
                            {Number(row.volume).toFixed(4)}
                          </span>
                        </>
                      ) : (
                        <span className="relative z-10 pl-1">-</span>
                      )
                    ) : null}
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
