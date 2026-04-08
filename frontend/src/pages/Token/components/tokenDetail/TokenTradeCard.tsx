import { useState, useEffect, useCallback } from 'react';
import ToggleGroup from '@/components/common/ToggleGroup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import PercentageBtn from './PercentageBtn';
import { tokenApi } from '@/api/tokenApi';
import Toast from '@/components/common/Toast';
import type { TokenPending, Order } from '@/types/tokenType';
import { Trashcan } from '@/components/icon/Icons';

interface TokenTradeCardProps {
  tokenId: number;
  marketPrice: number;
  tickerSymbol: string;
}

export default function TokenTradeCard({
  tokenId,
  marketPrice,
  tickerSymbol,
}: TokenTradeCardProps) {
  const tabs = [
    { id: 'buy', label: '매수' },
    { id: 'sell', label: '매도' },
    { id: 'pending', label: '미체결' },
  ];

  const [activeTab, setActiveTab] = useState('buy'); // buy | sell | pending
  const [orderType, setOrderType] = useState('LIMIT'); // LIMIT | MARKET
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');
  const [amount, setAmount] = useState('');
  const [pendingList, setPendingList] = useState<TokenPending[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const getNumPrice = () => Number(price.replace(/,/g, '')) || 0;
  const getNumVolume = () => Number(volume) || 0;
  const getNumAmount = () => Number(amount.replace(/,/g, '')) || 0;

  useEffect(() => {
    if (marketPrice && marketPrice > 0) {
      setPrice(marketPrice.toLocaleString());
    }
  }, [marketPrice]);

  // 1. 숫자 포맷팅 함수 (천단위 콤마 및 커서 제어)
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

  // 2. 날짜 포맷팅 함수
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

  // 3. 미체결 내역 조회
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

  // 4. 퍼센트 버튼 클릭 시 자동 계산
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

  // 5. 주문 검증 및 전송
  const handleOrder = async () => {
    const numPrice = getNumPrice();
    const numVolume = getNumVolume();
    const numAmount = getNumAmount();

    // 주문 정보
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

    // 검증 로직
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

  // 6. 주문 취소
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
    <div className="flex flex-col gap-4 border border-gray-100 rounded-[var(--radius-m)] p-6 shadow-std bg-white w-[420px] h-[450px]">
      <ToggleGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'pending' ? (
        /* --- 미체결 내역 --- */
        <div className="flex flex-col overflow-hidden">
          <div className="flex justify-between border-b border-gray-200 pb-2 text-gray-400 font-caption-01">
            <span>총 {pendingList.length}건</span>
            <span>최신순</span>
          </div>
          <div className="h-[450px] overflow-y-auto scrollbar-thin pr-1">
            {pendingList.length > 0 ? (
              pendingList.map((item) => (
                <div
                  key={item.orderId}
                  className="group relative py-4 border-b border-gray-200 last:border-0 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="absolute inset-0 bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 
                    flex items-center justify-center transition-opacity z-20 duration-300"
                  >
                    <button
                      onClick={() => cancelOrder(item.orderId)}
                      className="p-3 hover:scale-110 transition-transform text-gray-800 cursor-pointer"
                    >
                      <Trashcan size={44} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-body-04">
                          {tickerSymbol}/KRW
                        </span>
                        <span
                          className={`font-body-04 ${item.orderSide === 'BUY' ? 'text-error' : 'text-info'}`}
                        >
                          {item.orderSide === 'BUY' ? '매수' : '매도'}
                        </span>
                      </div>
                      <span className="text-gray-400 font-caption-01">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-caption-02">
                          주문가격
                        </span>
                        <span className="font-caption-03">
                          {Number(item.orderPrice).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-caption-02">
                          주문수량
                        </span>
                        <span className="font-caption-03">
                          {Number(item.orderVolume).toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-caption-02">
                          미체결량
                        </span>
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
              <div className="flex h-[320px] items-center justify-center text-gray-400">
                미체결 내역이 없습니다.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- 주문 입력 --- */
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-24 text-gray-400 font-caption-02">
              주문 유형
            </span>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full h-full min-h-[42px] px-2 pr-8 bg-gray-50 border border-gray-100
                rounded-[var(--radius-s)] outline-none font-caption-02 text-gray-900 cursor-pointer 
                hover:border-gray-200 transition-colors py-0 leading-[40px] flex items-center"
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
              <span className="w-24 text-gray-400 font-caption-02">
                주문 금액
              </span>
              <Input
                height={42}
                value={amount}
                onChange={(e) => handleInputChange(e, setAmount)}
                placeholder="예: 100,000"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-400 font-caption-02">
                주문 수량
              </span>
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
          />

          <div className="flex justify-between items-center pt-4">
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

      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
      )}
    </div>
  );
}
