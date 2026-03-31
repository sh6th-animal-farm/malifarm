import { useState } from 'react';
import type { SubscriptionApplicationDTO } from '@/types/subscriptionType';
import { subscriptionApi } from '@/api/subscriptionApi';

interface UseSubscriptionProps {
  price: number;
  userLimit: number;
  walletBalance: number;
  minAmountPerInvestor: number;
}

export function useSubscription({
  price,
  userLimit,
  walletBalance,
  minAmountPerInvestor,
}: UseSubscriptionProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = quantity * price;
  const usagePercent = (totalPrice / userLimit) * 100;

  // 에러 메시지 계산
  let errorMsg = '';
  if (totalPrice > walletBalance) errorMsg = '지갑 잔액이 부족합니다.';
  if (totalPrice > userLimit) errorMsg = '투자 한도를 초과했습니다.';
  if (quantity > 0 && totalPrice < minAmountPerInvestor) {
    errorMsg = `최소 청약 금액(${minAmountPerInvestor.toLocaleString()}원) 이상 입력해주세요.`;
  }

  const handleQuantityChange = (val: number) => setQuantity(val);

  const submitSubscription = async (data: SubscriptionApplicationDTO) => {
    setIsSubmitting(true);
    try {
      const response = await subscriptionApi.applySubscription(data);
      return response.data; // "success", "api_fail" 등
    } catch (error) {
      console.error('Subscription Submit Error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    quantity,
    totalPrice,
    usagePercent,
    errorMsg,
    handleQuantityChange,
    submitSubscription,
    isSubmitting,
  };
}
