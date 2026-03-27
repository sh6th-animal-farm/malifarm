import { useSubscription } from '@/pages/project/hook/useSubscription'; // 1. Hook 임포트
import { SubscriptionSummary } from './SubscriptionSummary';
import { InvestmentLimitBar } from './InvestmentLimitBar';
import { SubscriptionModalInput } from './SubscriptionModalInput';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: {
    projectId: string; // 추가
    tokenId: number;   // 추가
    title: string;
    price: number;
    thumbnail?: string;
    userLimit: number;
    walletBalance: number;
    minAmountPerInvestor: number;
  };
}

export default function SubscriptionModal({ isOpen, onClose, projectData }: SubscriptionModalProps) {
  
  // 2. Hook 호출: 필요한 모든 상태와 함수를 가져옵니다.
  const {
    quantity,
    totalPrice,
    usagePercent,
    errorMsg,
    handleQuantityChange,
    submitSubscription,
    isSubmitting
  } = useSubscription({
    price: projectData.price,
    userLimit: projectData.userLimit,
    walletBalance: projectData.walletBalance,
    minAmountPerInvestor: projectData.minAmountPerInvestor,
    projectId: projectData.projectId,
    tokenId: projectData.tokenId
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="w-[440px] rounded-[20px] bg-white p-6 shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-subtitle-01 text-gray-900">청약 신청하기</h3>
          <button className="text-2xl text-gray-900 hover:opacity-70" onClick={onClose}>&times;</button>
        </div>

        {/* 프로젝트 요약 카드 */}
        <SubscriptionSummary 
          thumbnail={projectData.thumbnail}
          title={projectData.title}
          labelText={`1 토큰 당 ${projectData.price.toLocaleString()}원`}
        />

        {/* 투자 한도 섹션 - 3. usagePercent 연결 */}
        <InvestmentLimitBar 
            label="나의 연간 투자 한도 잔여"
            usagePercent={usagePercent}
            usageText={`${Math.floor(usagePercent)}% 사용`}
            amountText={`${projectData.userLimit.toLocaleString()}원`}
        />

        {/* 수량 입력 섹션 - 4. value와 onChange 연결 */}
        <SubscriptionModalInput 
            label="청약 수량 입력"
            unit="토큰"
            minAmountText={`* 최소 청약 금액: ${projectData.minAmountPerInvestor.toLocaleString()}원`}
            value={quantity}
            onChange={handleQuantityChange}
            errorMsg={errorMsg}
        />

        {/* 지갑 정보 */}
        <div className="flex justify-between text-[13px] mb-5">
          <span className="text-gray-600">나의 지갑(Wallet) 잔액</span>
          <strong className="text-gray-900">{projectData.walletBalance.toLocaleString()}원</strong>
        </div>

        {/* 최종 결제 정보 - 6. totalPrice 연결 */}
        <div className="bg-gray-50 rounded-[12px] p-4 mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span className="font-caption-01">청약 수량</span>
            <span className="text-gray-700 font-caption-01">{quantity.toLocaleString(undefined, {maximumFractionDigits: 4})} 토큰</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs font-caption-02 text-gray-900">총 청약 금액</span>
            <span className="text-green-600 text-lg font-subtitle-01">{totalPrice.toLocaleString()} 원</span>
          </div>
        </div>

        {/* 신청 버튼 - 7. 비활성화 처리 및 전송 함수 연결 */}
        <button 
          className="w-full py-4 bg-green-600 text-white rounded-[12px] text-base font-bold transition-all hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-500"
          disabled={!!errorMsg || isSubmitting || quantity <= 0}
          onClick={async () => {
            const result = await submitSubscription();
            if (result === "success") {
              alert("청약 신청이 완료되었습니다!");
              onClose(); // 성공 시 모달 닫기
            }
          }}
        >
          {isSubmitting ? "처리 중..." : "청약 신청 완료"}
        </button>
      </div>
    </div>
  );
}