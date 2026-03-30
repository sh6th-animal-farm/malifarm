import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

interface AddressModalProps {
  isOpen: boolean;
  addressDraft: string;
  savingAddress: boolean;
  onChangeAddress: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function AddressModal({
  isOpen,
  addressDraft,
  savingAddress,
  onChangeAddress,
  onClose,
  onSave,
}: AddressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-std">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 md:px-6">
          <h3 className="font-subtitle-01 text-gray-900">주소 수정</h3>
          <button
            type="button"
            className="cursor-pointer font-subtitle-01 text-gray-700"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-4 md:px-6">
          <div className="flex items-center gap-2 rounded-[var(--radius-s)] border border-gray-200 bg-gray-50 px-3 py-2">
            <Input
              type="text"
              value={addressDraft}
              onChange={(event) => onChangeAddress(event.target.value)}
              placeholder="주소 등록이 필요합니다."
              className="!h-auto !border-0 !bg-transparent !p-0 font-body-01 text-gray-700 focus:!outline-none"
            />
            <Button
              type="button"
              variant="outline-default"
              width={92}
              height={32}
              className="shrink-0 font-button-02"
            >
              주소 검색
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 pb-4 md:px-6 md:pb-6">
          <Button
            type="button"
            variant="subscriptionEnd"
            width={52}
            height={36}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="check"
            width={52}
            height={36}
            onClick={onSave}
            disabled={savingAddress}
          >
            {savingAddress ? "저장중" : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
