import { useState, useEffect } from 'react';

interface UseSubscriptionProps {
  price: number;
  userLimit: number;
  walletBalance: number;
  minAmountPerInvestor: number;
  projectId: string;
  tokenId: number;
}

export const useSubscription = ({
  price,
  userLimit,
  walletBalance,
  minAmountPerInvestor,
  projectId,
  tokenId,
}: UseSubscriptionProps) => {
  const [quantity, setQuantity] = useState<number>(1); // 청약 수량
  const [totalPrice, setTotalPrice] = useState<number>(price); // 총 금액
  const [usagePercent, setUsagePercent] = useState<number>(0); // 한도 사용률
  const [errorMsg, setErrorMsg] = useState<string>(''); // 에러 메시지
  const [isSubmitting, setIsSubmitting] = useState(false); // 로딩 상태

  // 1. 수량이 변할 때마다 금액 및 한도 계산 (Side Effect)
  useEffect(() => {
    const total = Math.round(quantity * price);
    setTotalPrice(total);

    // 한도 사용률 계산
    if (userLimit > 0) {
      const percent = (total / userLimit) * 100;
      setUsagePercent(Math.min(Math.max(percent, 0), 100));
    }

    // 유효성 검사
    const maxAvailableAmount = Math.min(userLimit, walletBalance);
    const maxQuantity = maxAvailableAmount / price;

    if (total < minAmountPerInvestor) {
      setErrorMsg(
        `최소 청약 금액은 ${minAmountPerInvestor.toLocaleString()}원 입니다.`,
      );
    } else if (quantity > maxQuantity) {
      setErrorMsg('신청 가능한 최대 수량을 초과할 수 없습니다.');
    } else {
      setErrorMsg('');
    }
  }, [quantity, price, userLimit, walletBalance, minAmountPerInvestor]);

  // 2. 수량 입력 핸들러 (소수점 4자리 제한 포함)
  const handleQuantityChange = (val: string) => {
    if (val === '') {
      setQuantity('' as any);
      return;
    }
    setQuantity(val as any);
  };

  // 3. 청약 신청 서버 전송
  const submitSubscription = async () => {
    if (errorMsg || quantity <= 0) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('accessToken');

      const payload = {
        tokenId,
        projectId,
        subscriptionAmount: totalPrice,
        // 필요시 walletId 등 추가
      };

      // 기존 fetch 로직을 projectApi 등으로 대체 가능
      const response = await fetch('/api/subscription/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.text();
      return result.trim(); // "success" 등 결과 반환
    } catch (error) {
      console.error('Subscription Error:', error);
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
    isSubmitting,
    handleQuantityChange,
    submitSubscription,
  };
};
