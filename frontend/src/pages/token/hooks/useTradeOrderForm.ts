import { useCallback, useEffect, useState } from 'react';
import { tokenApi } from '@/api/tokenApi';
import type { Order, TokenPending } from '@/types/tokenType';

interface UseTradeOrderFormParams {
  tokenId: number;
  marketPrice: number;
}

type FormattedField = 'price' | 'amount';

export const useTradeOrderForm = ({
  tokenId,
  marketPrice,
}: UseTradeOrderFormParams) => {
  const [activeTab, setActiveTab] = useState('buy');
  const [orderType, setOrderType] = useState('LIMIT');
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

  const formatNumber = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    return num ? Number(num).toLocaleString() : '';
  };

  const handleFormattedInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: FormattedField,
  ) => {
    const { value, selectionStart } = e.target;
    const prevLen = value.length;
    const formatted = formatNumber(value);

    if (field === 'price') {
      setPrice(formatted);
    } else {
      setAmount(formatted);
    }

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
    if (activeTab === 'pending') return;

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

  return {
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
  };
};
