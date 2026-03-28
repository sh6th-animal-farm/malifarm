import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

interface PasswordModalProps {
  isOpen: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  changingPassword: boolean;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function PasswordModal({
  isOpen,
  currentPassword,
  newPassword,
  confirmPassword,
  changingPassword,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangeConfirmPassword,
  onClose,
  onSubmit,
}: PasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-std">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 md:px-6">
          <h3 className="font-subtitle-01 text-gray-900">비밀번호 변경</h3>
          <button
            type="button"
            className="cursor-pointer font-subtitle-01 text-gray-700"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 px-4 py-4 md:px-6">
          <div>
            <p className="mb-1 font-caption-02 text-gray-500">현재 비밀번호</p>
            <Input
              type="password"
              value={currentPassword}
              onChange={(event) => onChangeCurrentPassword(event.target.value)}
            />
          </div>
          <div>
            <p className="mb-1 font-caption-02 text-gray-500">새 비밀번호</p>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => onChangeNewPassword(event.target.value)}
            />
          </div>
          <div>
            <p className="mb-1 font-caption-02 text-gray-500">새 비밀번호 확인</p>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => onChangeConfirmPassword(event.target.value)}
            />
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
            onClick={onSubmit}
            disabled={changingPassword}
          >
            {changingPassword ? "변경중" : "변경"}
          </Button>
        </div>
      </div>
    </div>
  );
}
