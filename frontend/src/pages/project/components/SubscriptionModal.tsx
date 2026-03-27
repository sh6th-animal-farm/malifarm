import { useSubscription } from '@/pages/project/hook/useSubscription'; // 1. Hook 임포트

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
          <h3 className="text-lg font-bold text-gray-900">청약 신청하기</h3>
          <button className="text-2xl text-gray-900 hover:opacity-70" onClick={onClose}>&times;</button>
        </div>

        {/* 프로젝트 요약 카드 */}
        <div className="flex items-center gap-3.5 bg-gray-50 rounded-[12px] p-3.5 mb-5">
          <img src={projectData.thumbnail || "/default-thumb.png"} className="w-16 h-16 rounded-lg object-cover" alt="thumb" />
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-gray-800">{projectData.title}</div>
            <div className="text-green-600 text-sm font-bold">1 토큰 당 {projectData.price.toLocaleString()}원</div>
          </div>
        </div>

        {/* 투자 한도 섹션 - 3. usagePercent 연결 */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>나의 연간 투자 한도 잔여</span>
            <span className="text-green-600 font-medium">{Math.floor(usagePercent)}% 사용</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-300" 
              style={{ width: `${usagePercent}%` }} 
            ></div>
          </div>
          <div className="text-right mt-2 text-xs font-medium text-gray-700">
            {projectData.userLimit.toLocaleString()}원
          </div>
        </div>

        {/* 수량 입력 섹션 - 4. value와 onChange 연결 */}
        <div className="mb-1">
          <label className="block text-sm font-semibold text-gray-800 mb-2.5">청약 수량 입력</label>
          <div className={`flex items-center gap-2 border-[1.5px] h-[60px] rounded-[12px] px-4 transition-all ${errorMsg ? 'border-red-500 bg-red-50' : 'border-gray-900'}`}>
            <input 
              type="number" 
              className="flex-1 text-right text-xl font-bold bg-transparent outline-none"
              value={quantity} // Hook의 상태값
              onChange={(e) => handleQuantityChange(e.target.value)} // Hook의 핸들러
              step="0.0001"
            />
            <span className="text-sm font-semibold text-gray-800 shrink-0">토큰</span>
          </div>
          <div className="mt-1 text-right min-h-[20px]">
            {/* 5. 에러 메시지 조건부 렌더링 */}
            {errorMsg ? (
              <p className="text-[11px] text-red-500 font-medium">{errorMsg}</p>
            ) : (
              <p className="text-[11px] text-gray-400">* 최소 청약 금액: {projectData.minAmountPerInvestor.toLocaleString()}원</p>
            )}
          </div>
        </div>

        {/* 지갑 정보 */}
        <div className="flex justify-between text-[13px] mb-5">
          <span className="text-gray-600">나의 지갑(Wallet) 잔액</span>
          <strong className="text-gray-900">{projectData.walletBalance.toLocaleString()}원</strong>
        </div>

        {/* 최종 결제 정보 - 6. totalPrice 연결 */}
        <div className="bg-gray-50 rounded-[12px] p-4 mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>청약 수량</span>
            <span className="text-gray-700 font-medium">{quantity.toLocaleString(undefined, {maximumFractionDigits: 4})} 토큰</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-900">총 청약 금액</span>
            <span className="text-green-600 text-lg font-bold">{totalPrice.toLocaleString()} 원</span>
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