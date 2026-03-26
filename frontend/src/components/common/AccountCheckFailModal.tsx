interface AccountCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  primaryButtonText: string;  // "증권 계좌 연동하기" 등을 외부에서 주입
  secondaryButtonText: string; // "다시 시도" 또는 "닫기"
  onPrimaryClick: () => void;  // 버튼 클릭 시 실행할 함수
}

export default function AccountCheckFailModal({ 
  isOpen, 
  onClose, 
  title, 
  description,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick
}: AccountCheckModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[8px]">
      <div className="w-[90%] max-w-[360px] bg-white rounded-[12px] p-[36px_24px_24px_24px] text-center shadow-std animate-[modal-fade-in_0.3s_ease-out]">
        
        {/* 아이콘 영역 생략 (동일) */}

        <h2 className="text-[18px] font-bold text-gray-900 mb-[28px]">{title}</h2>
        <div className="text-[14px] text-gray-900 mb-[28px] leading-[1.6]">
          {description}
        </div>

        <div className="flex flex-col gap-[12px]">
          <button 
            onClick={onPrimaryClick}
            className="w-full p-[16px] bg-gray-900 text-white rounded-[8px] font-semibold"
          >
            {primaryButtonText}
          </button>
          <button 
            onClick={onClose}
            className="w-full p-[16px] bg-white text-green-600 border border-green-600 rounded-[8px] font-semibold"
          >
            {secondaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}