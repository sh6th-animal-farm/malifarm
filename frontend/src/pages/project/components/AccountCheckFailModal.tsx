import React, { useEffect } from 'react'; // 경로 확인 필요
import { WarningCircle } from '@/components/icon/Icons'; // 경로 확인 필요
import Button from '@/components/common/Button';

interface AccountCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  primaryButtonText: string;
  secondaryButtonText: string;
  onPrimaryClick: () => void;
}

export default function AccountCheckFailModal({
  isOpen,
  onClose,
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
}: AccountCheckModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[8px]"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[360px] bg-white rounded-[12px] p-[36px_24px_24px_24px] text-center shadow-std"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ Icons.tsx의 Warning 아이콘 사용 */}
        <div className="w-[60px] h-[60px] rounded-full bg-red-50 flex items-center justify-center mx-auto mb-[24px]">
          <WarningCircle size={32} color="#EF4444" />
        </div>

        <h2 className="font-subtitle-01 text-gray-900 mb-[28px]">{title}</h2>
        <div className="font-caption-01 text-gray-900 mb-[28px] height leading-[1.6]">
          {description}
        </div>

        <div className="flex flex-col gap-[12px]">
          <Button
            variant="sub_modalFirst"
            width="100%"
            height={56} // JSP의 p-[16px]와 유사한 높이
            onClick={onPrimaryClick}
          >
            {primaryButtonText}
          </Button>
          <Button
            variant="sub_modalSecond"
            width="100%"
            height={56}
            onClick={onClose}
          >
            {secondaryButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
