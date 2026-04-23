import ToggleGroup from '@/components/common/ToggleGroup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import PercentageBtn from './PercentageBtn';
import Toast from '@/components/common/Toast';
import { Trashcan } from '@/components/icon/Icons';
import { useTradeOrderForm } from '@/pages/token/hooks/useTradeOrderForm';

interface TokenTradeCardProps {
  tokenId: number;
  marketPrice: number;
  tickerSymbol: string;
  isMobileCombined?: boolean;
  embedded?: boolean;
}

export default function TokenTradeCard({
  tokenId,
  marketPrice,
  tickerSymbol,
  isMobileCombined = false,
  embedded = false,
}: TokenTradeCardProps) {
  const tabs = [
    { id: 'buy', label: '매수' },
    { id: 'sell', label: '매도' },
    { id: 'pending', label: '미체결' },
  ];

  const {
    activeTab,
    setActiveTab,
    orderType,
    setOrderType,
    price,
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

  return (
    <div
      className={`flex flex-col gap-4 numeric-fixed ${embedded ? 'border-0 rounded-none shadow-none p-3' : 'rounded-[var(--radius-m)] p-4 md:p-6 shadow-std bg-white'} w-full md:w-[420px] ${
        isMobileCombined ? 'h-full' : 'h-[450px]'
      }`}
    >
      <ToggleGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        fullWidth
      />

      {activeTab === 'pending' ? (
        /* --- 미체결 내역 --- */
        <div className="flex flex-col overflow-hidden">
          <div className="flex justify-between border-b border-gray-200 pb-2 text-gray-400 font-caption-01">
            <span>총 {pendingList.length}건</span>
            <span>최신순</span>
          </div>
          <div
            className={`${isMobileCombined ? 'h-full' : 'h-[450px]'} overflow-y-auto scrollbar-thin pr-1`}
          >
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
                onChange={(e) => handleFormattedInputChange(e, 'price')}
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
                onChange={(e) => handleFormattedInputChange(e, 'amount')}
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
