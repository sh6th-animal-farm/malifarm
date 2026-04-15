import { useWallet } from '@/pages/project/hook/useWallet';
import { useSubscription } from '@/pages/project/hook/useSubscription';
import { SubscriptionSummary } from './SubscriptionSummary';
import { InvestmentLimitBar } from './InvestmentLimitBar';
import { SubscriptionModalInput } from './SubscriptionModalInput';
import { subscriptionApi } from '../../../api/subscriptionApi';
import { useEffect } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  setToastMsg: (msg: string | null) => void;
  projectData: {
    userId: string | number;
    projectId: string | number;
    tokenId: number;
    title: string;
    price: number;
    thumbnail?: string;
    userLimit: number;
    minAmountPerInvestor: number;
  };
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  setToastMsg,
  onSuccess,
  projectData,
}: SubscriptionModalProps) {
  const { walletData, isLoading: isWalletLoading } = useWallet(
    projectData.userId,
  );
  const currentCashBalance = walletData?.cashBalance ?? 0;

  const {
    quantity,
    totalPrice,
    usagePercent,
    errorMsg,
    handleQuantityChange,
    isSubmitting,
  } = useSubscription({
    price: projectData.price,
    userLimit: projectData.userLimit,
    walletBalance: currentCashBalance,
    minAmountPerInvestor: projectData.minAmountPerInvestor,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyClick = async () => {
    try {
      const payload = {
        projectId: Number(projectData.projectId),
        userId: Number(projectData.userId),
        subscriptionAmount: totalPrice,
        tokenId: Number(projectData.tokenId),

        subscriptionStatus: 'PENDING',
        paymentStatus: 'RESERVED',
      };

      console.log('보내는 데이터 확인:', payload);

      // 2. API 호출
      const result = await subscriptionApi.applySubscription(payload);

      // 3. 백엔드 리턴값 분기 처리 (ResponseEntity.ok("success") 등)
      if (result === 'success') {
        onClose();
        setToastMsg('청약 신청이 완료되었습니다.');
        onSuccess();
      } else if (result === 'api_fail') {
        alert(
          'DB 저장은 성공했으나, 증권사 시스템 전송에 실패했습니다. 고객센터로 문의하세요.',
        );
        onClose();
      } else if (result === 'empty_payload') {
        alert('증권사로 보낼 데이터가 비어있습니다. 입력값을 확인해주세요.');
      } else {
        alert(`신청 실패: ${result}`);
      }
    } catch (err: any) {
      console.error('청약 통신 에러:', err);
      // 서버가 500 에러를 던지면 여기로 들어옵니다.
      alert(
        err.response?.data || '서버 오류로 인해 신청을 완료할 수 없습니다.',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
      <div
        className="w-[440px] rounded-[20px] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">청약 신청하기</h3>
          <button
            className="text-2xl text-gray-400 hover:text-gray-900"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <SubscriptionSummary
          thumbnail={projectData.thumbnail}
          title={projectData.title}
          labelText={`1 토큰 당 ${projectData.price.toLocaleString()}원`}
        />

        <InvestmentLimitBar
          label="나의 연간 투자 한도 잔여"
          usagePercent={usagePercent}
          usageText={`${Math.floor(usagePercent)}% 사용`}
          amountText={`${projectData.userLimit.toLocaleString()}원`}
        />

        <SubscriptionModalInput
          label="청약 수량 입력"
          unit="토큰"
          value={quantity}
          onChange={handleQuantityChange}
          errorMsg={errorMsg}
          minAmountText={`* 최소 청약 금액: ${projectData.minAmountPerInvestor.toLocaleString()}원`}
        />

        <div className="bg-gray-50 rounded-[12px] p-4 mb-5">
          <div className="px-0.5 font-caption-02 text-gray-400 flex justify-between items-center mb-3">
            <span>나의 지갑 잔액</span>
            <span>
              {isWalletLoading
                ? '조회 중...'
                : `${currentCashBalance.toLocaleString()}원`}
            </span>
          </div>
          <div className="border border-[0.5px] border-gray-200 rounded-[8px]" />
          <div className="pt-2 px-0.5 flex items-center justify-between text-xs text-gray-600">
            <span className="font-caption-03 text-gray-600">총 청약 금액</span>
            <span className="text-green-600 text-xl font-semibold">
              {totalPrice.toLocaleString()} 원
            </span>
          </div>
        </div>

        <button
          className="w-full py-4 bg-green-600 text-white rounded-[12px] font-bold transition-all hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400"
          disabled={!!errorMsg || isSubmitting || quantity <= 0}
          onClick={handleApplyClick}
        >
          {isSubmitting ? '처리 중...' : '청약 신청하기'}
        </button>
      </div>
    </div>
  );
}
