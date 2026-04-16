import { useEffect, useRef } from 'react';
import ToggleGroup from '@/components/common/ToggleGroup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import PercentageBtn from '../tokenDetail/PercentageBtn';
import Toast from '@/components/common/Toast';
import type { OrderInfo, TokenOhlcv } from '@/types/tokenType';
import { Trashcan } from '@/components/icon/Icons';
import { useOrderbookLadder } from '@/pages/Token/hooks/useOrderbookLadder';
import { useTradeOrderForm } from '@/pages/Token/hooks/useTradeOrderForm';

interface MobileTokenTradeCardProps {
  tokenId: number;
  marketPrice: number;
  tickerSymbol: string;
  ohlcv: TokenOhlcv | null;
  buyList: OrderInfo[];
  sellList: OrderInfo[];
}

export default function MobileTokenTradeCard({
  tokenId,
  marketPrice,
  tickerSymbol,
  ohlcv,
  buyList,
  sellList,
}: MobileTokenTradeCardProps) {
  const tabs = [
    { id: 'buy', label: '매수' },
    { id: 'sell', label: '매도' },
    { id: 'pending', label: '미체결' },
  ];

  const ladder = useOrderbookLadder({ ohlcv, buyList, sellList });
  const orderbookScrollRef = useRef<HTMLDivElement>(null);
  const {
    activeTab,
    setActiveTab,
    orderType,
    setOrderType,
    price,
    setPrice,
    volume,
    setVolume,
    amount,
    pendingList,
    toastMsg,
    setToastMsg,
    getNumPrice,
    getNumVolume,
    getNumAmount,
    handleFormattedInputChange,
    formatDateTime,
    handlePercentageClick,
    handleOrder,
    cancelOrder,
  } = useTradeOrderForm({ tokenId, marketPrice });

  useEffect(() => {
    if (!ohlcv || !orderbookScrollRef.current || ladder.length === 0) return;

    const container = orderbookScrollRef.current;
    const centerCurrentRow = () => {
      const currentRow = container.querySelector<HTMLDivElement>(
        'div[data-current-row="true"]',
      );
      if (!currentRow) return;
      currentRow.scrollIntoView({ block: 'center', inline: 'nearest' });
    };

    const raf1 = requestAnimationFrame(() => {
      centerCurrentRow();
      requestAnimationFrame(centerCurrentRow);
    });
    const timer = window.setTimeout(centerCurrentRow, 80);

    return () => {
      cancelAnimationFrame(raf1);
      window.clearTimeout(timer);
    };
  }, [ohlcv?.tokenId, ladder.length]);

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-white">
      <div className="flex w-2/5 min-w-0 flex-col border-r border-gray-100">
        <div
          ref={orderbookScrollRef}
          className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {ladder.map((row, idx) => {
            const isSell = row.side === 'SELL';
            const hasBottomDivider = idx !== ladder.length - 1;
            const priceBgClass = isSell ? 'bg-info-light' : 'bg-error-light';
            return (
              <div
                key={`${row.price}-${idx}`}
                data-current-row={row.isCurrent ? 'true' : undefined}
                className={`grid h-9 grid-cols-[1.25fr_1fr] ${hasBottomDivider ? 'border-b border-gray-100' : ''}`}
              >
                <div
                  onClick={() => {
                    setPrice(row.price.toLocaleString());
                  }}
                  className={`flex h-full cursor-pointer items-center justify-center px-2 text-center font-body-02 ${isSell ? 'text-info' : 'text-error'} ${priceBgClass}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPrice(row.price.toLocaleString());
                    }
                  }}
                  style={
                    row.isCurrent
                      ? {
                          boxShadow: `inset 0 0 0 2px ${
                            isSell ? 'var(--color-info)' : 'var(--color-error)'
                          }`,
                        }
                      : undefined
                  }
                >
                  {row.price.toLocaleString()}
                </div>
                <div className="relative flex h-full items-center justify-end">
                  <span className="relative z-10 px-2 font-caption-02 text-gray-600">
                    {row.volume > 0 ? Number(row.volume).toFixed(4) : '-'}
                  </span>
                  {row.volume > 0 && (
                    <div
                      className={`absolute left-0 top-1/2 h-[20px] -translate-y-1/2 rounded-r-[var(--radius-s)] ${isSell ? 'bg-info/20' : 'bg-error/20'}`}
                      style={{ width: `${Math.max(row.ratio, 8)}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex w-3/5 min-w-0 flex-col px-4 py-4">
        <div>
          <ToggleGroup
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            fullWidth
            height={44}
          />
        </div>

        {activeTab === 'pending' ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
            <div className="flex justify-between border-b border-gray-200 pb-2 text-gray-400 font-caption-01">
              <span>총 {pendingList.length}건</span>
              <span>최신순</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin pr-1">
              {pendingList.length > 0 ? (
                pendingList.map((item) => (
                  <div
                    key={item.orderId}
                    className="group relative border-b border-gray-200 bg-white py-4 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                      <button
                        onClick={() => cancelOrder(item.orderId)}
                        className="cursor-pointer p-3 text-gray-800 transition-transform hover:scale-110"
                      >
                        <Trashcan size={44} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-body-04 text-gray-900">
                            {tickerSymbol}/KRW
                          </span>
                          <span
                            className={`font-body-04 ${item.orderSide === 'BUY' ? 'text-error' : 'text-info'}`}
                          >
                            {item.orderSide === 'BUY' ? '매수' : '매도'}
                          </span>
                        </div>
                        <span className="font-caption-02 text-gray-400">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between">
                          <span className="font-caption-02 text-gray-400">주문가격</span>
                          <span className="font-body-03">
                            {Number(item.orderPrice).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-caption-02 text-gray-400">주문수량</span>
                          <span className="font-body-03">
                            {Number(item.orderVolume).toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-caption-02 text-gray-400">미체결량</span>
                          <span
                            className={`font-body-03 ${item.orderSide === 'BUY' ? 'text-error' : 'text-info'}`}
                          >
                            {Number(item.remainingToken).toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center text-gray-400 font-caption-02">
                  미체결 내역이 없습니다.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-400 font-caption-03">주문 유형</span>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-full min-h-[42px] px-2 pr-8 bg-gray-50 border border-gray-100 rounded-[var(--radius-s)] outline-none font-caption-01 text-gray-900 cursor-pointer hover:border-gray-200 transition-colors py-0 leading-[40px] flex items-center"
              >
                <option value="LIMIT">지정가</option>
                <option value="MARKET">시장가</option>
              </select>
            </div>

            {orderType === 'LIMIT' && (
              <div className="flex items-center gap-2">
                <span className="w-24 text-gray-400 font-caption-03">
                  {activeTab === 'buy' ? '매수 가격' : '매도 가격'}
                </span>
                <Input
                  height={42}
                  value={price}
                  onChange={(e) => handleFormattedInputChange(e, 'price')}
                  placeholder="예: 100,000"
                />
              </div>
            )}

            {activeTab === 'buy' && orderType === 'MARKET' ? (
              <div className="flex items-center gap-2">
                <span className="w-24 text-gray-400 font-body-03">주문 금액</span>
                <Input
                  height={42}
                  value={amount}
                  onChange={(e) => handleFormattedInputChange(e, 'amount')}
                  placeholder="예: 100,000"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-24 text-gray-400 font-caption-03">주문 수량</span>
                <Input
                  height={42}
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="예: 1.5"
                />
              </div>
            )}

            <PercentageBtn
              type={activeTab as 'buy' | 'sell'}
              onClick={handlePercentageClick}
              gapClassName="gap-1"
            />

            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="text-gray-900 font-body-04">
                총 {activeTab === 'buy' ? '주문 금액' : '주문 수량'}
              </span>
              <span
                className={`font-body-04 ${activeTab === 'buy' ? 'text-error' : 'text-info'}`}
              >
                {activeTab === 'buy'
                  ? (orderType === 'LIMIT'
                      ? (getNumPrice() * getNumVolume()).toLocaleString()
                      : getNumAmount().toLocaleString()) + ' KRW'
                  : getNumVolume().toFixed(4) + ' 개'}
              </span>
            </div>

            <Button
              variant={activeTab === 'buy' ? 'buy' : 'sell'}
              width="100%"
              height={48}
              onClick={handleOrder}
            >
              {activeTab === 'buy' ? '매수' : '매도'}
            </Button>
          </div>
        )}
      </div>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );
}
