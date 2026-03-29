import { useEffect, useState } from 'react';
import { useWallet } from '@/pages/project/hook/useWallet'; // 방금 만든 훅
import { useSubscription } from '@/pages/project/hook/useSubscription';
import { SubscriptionSummary } from './SubscriptionSummary';
import { InvestmentLimitBar } from './InvestmentLimitBar';
import { SubscriptionModalInput } from './SubscriptionModalInput';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: {
    userId: string | number; // 부모로부터 받은 userId
    projectId: string;
    tokenId: number;
    title: string;
    price: number;
    thumbnail?: string;
    userLimit: number;
    walletBalance: number;
    minAmountPerInvestor: number;
  };
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  projectData,
}: SubscriptionModalProps) {
  // 1. useWallet 훅을 사용하여 실시간 지갑 정보 가져오기
  const { walletData, isLoading } = useWallet(projectData.userId);

  // 데이터가 왔는지 확인용
  useEffect(() => {
    console.log('현재 모달의 지갑 데이터:', walletData);
  }, [walletData]);

  const currentCashBalance = walletData?.cashBalance ?? 0;

  // 3. 청약 로직 훅에 실시간 잔액 주입
  const {
    quantity,
    totalPrice,
    usagePercent,
    errorMsg,
    handleQuantityChange,
    submitSubscription,
    isSubmitting,
  } = useSubscription({
    price: projectData.price,
    userLimit: projectData.userLimit,
    walletBalance: currentCashBalance,
    minAmountPerInvestor: projectData.minAmountPerInvestor,
    projectId: projectData.projectId,
    tokenId: projectData.tokenId,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[440px] rounded-[20px] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-subtitle-01 text-gray-900 font-bold">
            청약 신청하기
          </h3>
          <button
            className="text-2xl text-gray-900 hover:opacity-70"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        {/* 요약 및 한도 바 */}
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
        {/* 입력 섹션 */}
        <SubscriptionModalInput
          label="청약 수량 입력"
          unit="토큰"
          value={quantity}
          onChange={handleQuantityChange}
          errorMsg={errorMsg}
          minAmountText={`* 최소 청약 금액: ${projectData.minAmountPerInvestor.toLocaleString()}원`}
        />
        {/* 나의 지갑 잔액 (실시간 데이터) */}
        <div className="flex justify-between text-[13px] mb-5 px-1">
          <span className="text-gray-600 font-medium">
            나의 지갑(Wallet) 잔액
          </span>
          <strong className="text-gray-900">
            {isLoading
              ? '조회 중...'
              : `${currentCashBalance.toLocaleString()}원`}
          </strong>
        </div>
        {/* 결제 요약 및 버튼 */}
        <div className="bg-gray-50 rounded-[12px] p-4 mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-3 font-medium">
            <span>청약 수량</span>
            <span>{quantity.toLocaleString()} 토큰</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-900">
              총 청약 금액
            </span>
            <span className="text-green-600 text-lg font-bold">
              {totalPrice.toLocaleString()} 원
            </span>
          </div>
        </div>
        <button
          className="w-full py-4 bg-green-600 text-white rounded-[12px] text-base font-bold transition-all hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-500"
          disabled={!!errorMsg || isSubmitting || quantity <= 0}
          onClick={async () => {
            const result = await submitSubscription();
            if (result === 'success') {
              alert('청약 신청이 완료되었습니다!');
              refreshWallet(); // 성공 시 잔액 갱신
              onClose();
            }
          }}
        >
          {isSubmitting ? '처리 중...' : '청약 신청 완료'}
        </button>
      </div>
    </div>
  );
}
