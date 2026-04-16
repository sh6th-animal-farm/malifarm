import { useState, useEffect, useCallback, useRef } from 'react';
import ToggleGroup from '@/components/common/ToggleGroup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import PercentageBtn from '../tokenDetail/PercentageBtn';
import { tokenApi } from '@/api/tokenApi';
import Toast from '@/components/common/Toast';
import type { OrderInfo, TokenOhlcv, TokenPending, Order } from '@/types/tokenType';
import { Trashcan } from '@/components/icon/Icons';
import { useOrderbookLadder } from '@/pages/Token/hooks/useOrderbookLadder';

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

  const [activeTab, setActiveTab] = useState('buy');
  const [orderType, setOrderType] = useState('LIMIT');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');
  const [amount, setAmount] = useState('');
  const [pendingList, setPendingList] = useState<TokenPending[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const ladder = useOrderbookLadder({ ohlcv, buyList, sellList });
  const orderbookScrollRef = useRef<HTMLDivElement>(null);

  const getNumPrice = () => Number(price.replace(/,/g, '')) || 0;
  const getNumVolume = () => Number(volume) || 0;
  const getNumAmount = () => Number(amount.replace(/,/g, '')) || 0;

  useEffect(() => {
    if (marketPrice && marketPrice > 0) {
      setPrice(marketPrice.toLocaleString());
    }
  }, [marketPrice]);

  const formatNumber = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    return num ? Number(num).toLocaleString() : '';
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
  ) => {
    const { value, selectionStart } = e.target;
    const prevLen = value.length;
    const formatted = formatNumber(value);
    setter(formatted);

    setTimeout(() => {
      if (selectionStart !== null) {
        const newPos = selectionStart + (formatted.length - prevLen);
        e.target.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const fetchPendingOrders = useCallback(async () => {
    try {
      const data = await tokenApi.getPendingList(tokenId);
      setPendingList(data || []);
    } catch (error) {
      console.error('미체결 내역 조회 실패:', error);
    }
  }, [tokenId]);

  useEffect(() => {
    if (activeTab === 'pending') fetchPendingOrders();
  }, [activeTab, fetchPendingOrders]);

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

  const handlePercentageClick = async (perc: number) => {
    try {
      let balanceStr = '0';
      if (activeTab === 'buy') {
        const data = await tokenApi.getCashBalance();
        balanceStr = String(data);
      } else {
        const data = await tokenApi.getTokenBalance(tokenId);
        balanceStr = String(data);
      }

      const balance = Number(balanceStr);
      const calculatedValue = balance * (perc / 100);

      if (activeTab === 'buy') {
        if (orderType === 'MARKET') {
          setAmount(Math.floor(calculatedValue).toLocaleString());
        } else {
          const currentPrice = getNumPrice();
          if (currentPrice > 0) {
            setVolume((calculatedValue / currentPrice).toFixed(4));
          }
        }
      } else {
        setVolume(calculatedValue.toFixed(4));
      }
    } catch (error) {
      console.error('잔액 조회 실패:', error);
    }
  };

  const handleOrder = async () => {
    const numPrice = getNumPrice();
    const numVolume = getNumVolume();
    const numAmount = getNumAmount();

    const order: Order = {
      tokenId,
      orderSide: activeTab === 'buy' ? 'BUY' : 'SELL',
      orderType: orderType as 'LIMIT' | 'MARKET',
      orderPrice: orderType === 'LIMIT' ? numPrice.toString() : '0',
      orderVolume:
        activeTab === 'buy' && orderType === 'MARKET'
          ? '0'
          : numVolume.toString(),
      totalPrice:
        activeTab === 'buy'
          ? orderType === 'LIMIT'
            ? (numPrice * numVolume).toString()
            : numAmount.toString()
          : '0',
    };

    if (order.orderSide === 'BUY') {
      if (orderType === 'LIMIT') {
        if (!price || price === '' || price === '0')
          return setToastMsg('가격을 입력해주세요.');
        if (!volume || volume === '' || volume === '0')
          return setToastMsg('수량을 입력해주세요.');
      } else if (orderType === 'MARKET') {
        if (!amount || amount === '' || amount === '0')
          return setToastMsg('주문 총액을 입력해주세요.');
      }

      if (Number(order.totalPrice) < 1000) {
        return setToastMsg('최소 주문 금액은 1,000원입니다.');
      }
    } else {
      if (!volume || volume === '' || volume === '0')
        return setToastMsg('수량을 입력해주세요.');
      if (orderType === 'LIMIT' && (!price || price === '' || price === '0'))
        return setToastMsg('가격을 입력해주세요.');

      if (numVolume < 0.00001)
        return setToastMsg('최소 주문 수량은 0.00001개입니다.');
    }

    try {
      await tokenApi.createOrder(tokenId, order);
      setToastMsg('주문 완료');
      setPrice('');
      setVolume('');
      setAmount('');
    } catch (e) {
      console.error('주문 실패:', e);
      setToastMsg('주문 실패');
    }
  };

  const cancelOrder = async (orderId: number) => {
    try {
      await tokenApi.cancelOrder(tokenId, orderId);
      setToastMsg('주문 취소');
      fetchPendingOrders();
    } catch (e) {
      console.error('주문 취소 실패:', e);
      setToastMsg('주문 취소 실패');
    }
  };

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
                className={`grid h-9 grid-cols-[1fr_1.3fr] ${hasBottomDivider ? 'border-b border-gray-100' : ''}`}
              >
                <div
                  className={`flex h-full items-center justify-center px-2 text-center font-body-03 ${isSell ? 'text-info' : 'text-error'} ${priceBgClass}`}
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
                        <span className="font-caption-01 text-gray-400">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between">
                          <span className="font-caption-01 text-gray-400">주문가격</span>
                          <span className="font-caption-03">
                            {Number(item.orderPrice).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-caption-01 text-gray-400">주문수량</span>
                          <span className="font-caption-03">
                            {Number(item.orderVolume).toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-caption-01 text-gray-400">미체결량</span>
                          <span
                            className={`font-caption-03 ${item.orderSide === 'BUY' ? 'text-error' : 'text-info'}`}
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
              <span className="w-24 text-gray-400 font-caption-02">주문 유형</span>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-full min-h-[42px] px-2 pr-8 bg-gray-50 border border-gray-100 rounded-[var(--radius-s)] outline-none font-caption-02 text-gray-900 cursor-pointer hover:border-gray-200 transition-colors py-0 leading-[40px] flex items-center"
              >
                <option value="LIMIT">지정가</option>
                <option value="MARKET">시장가</option>
              </select>
            </div>

            {orderType === 'LIMIT' && (
              <div className="flex items-center gap-2">
                <span className="w-24 text-gray-400 font-caption-02">
                  {activeTab === 'buy' ? '매수 가격' : '매도 가격'}
                </span>
                <Input
                  height={42}
                  value={price}
                  onChange={(e) => handleInputChange(e, setPrice)}
                  placeholder="예: 100,000"
                />
              </div>
            )}

            {activeTab === 'buy' && orderType === 'MARKET' ? (
              <div className="flex items-center gap-2">
                <span className="w-24 text-gray-400 font-caption-02">주문 금액</span>
                <Input
                  height={42}
                  value={amount}
                  onChange={(e) => handleInputChange(e, setAmount)}
                  placeholder="예: 100,000"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-24 text-gray-400 font-caption-02">주문 수량</span>
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
              <span className="text-gray-900 font-body-03">
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
