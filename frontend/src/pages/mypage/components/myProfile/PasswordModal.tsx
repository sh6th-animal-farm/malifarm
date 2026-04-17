import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { validatePassword } from '@/pages/Auth/hook/passwordValidation';
import { useMemo } from 'react';

interface PasswordModalProps {
  isOpen: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  changingPassword: boolean;
  currentPasswordError?: string | null;
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
  currentPasswordError,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangeConfirmPassword,
  onClose,
  onSubmit,
}: PasswordModalProps) {
  // 1. 새 비밀번호 검증 (입력 시마다 자동 계산)
  const passwordValidation = useMemo(
    () => validatePassword(newPassword),
    [newPassword],
  );

  // 2. 비밀번호 확인 일치 여부
  const isPasswordMatch = newPassword === confirmPassword;

  // 에러 메시지가 떠 있는 동안은 하단 가이드 문구들을 숨기기 위한 플래그
  const hasError = !!currentPasswordError;

  // 3. 버튼 활성화 조건 (현재 비밀번호 입력 && 새 비밀번호 유효 && 일치 && 변경 중 아님)
  const isSubmitDisabled =
    !currentPassword ||
    !passwordValidation.isValid ||
    !isPasswordMatch ||
    !confirmPassword ||
    changingPassword;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[440px] rounded-lg bg-white shadow-std">
        <div className="flex items-center justify-between px-4 py-4 md:px-6">
          <h3 className="font-body-03 text-gray-800">비밀번호 변경</h3>
          <button
            type="button"
            className="cursor-pointer font-subtitle-01 text-gray-800"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="mb-1 font-caption-02 text-gray-500">현재 비밀번호</p>
            <Input
              type="password"
              value={currentPassword}
              onChange={(event) => onChangeCurrentPassword(event.target.value)}
            />
            {/* 서버 응답 실패 시 메시지 출력 */}
            {currentPasswordError && (
              <p className="px-1 mt-1 text-xs text-error">
                {currentPasswordError}
              </p>
            )}
          </div>
          <div>
            <p className="mb-1 font-caption-02 text-gray-500">새 비밀번호</p>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => onChangeNewPassword(event.target.value)}
            />
            {/* 새 비밀번호 유효성 검사 결과 표시 */}
            {!hasError && newPassword && (
              <>
                {!passwordValidation.isValid ? (
                  <p className="px-1 mt-1 text-xs text-error">
                    {passwordValidation.message}
                  </p>
                ) : (
                  <p className="px-1 mt-1 text-xs text-green-600">
                    사용 가능한 비밀번호입니다.
                  </p>
                )}
              </>
            )}
          </div>
          <div>
            <p className="mb-1 font-caption-02 text-gray-500">
              새 비밀번호 확인
            </p>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => onChangeConfirmPassword(event.target.value)}
            />
            {/* 비밀번호 일치 여부 표시 */}
            {!hasError && confirmPassword && (
              <>
                {!isPasswordMatch ? (
                  <p className="px-1 mt-1 text-xs text-error">
                    비밀번호가 일치하지 않습니다.
                  </p>
                ) : (
                  <p className="px-1 mt-1 text-xs text-green-600">
                    비밀번호가 일치합니다.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-4 md:px-6 md:pb-6">
          <Button
            type="button"
            variant="subscriptionEnd"
            width={100}
            height={50}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="check"
            width={300}
            height={50}
            onClick={onSubmit}
            disabled={isSubmitDisabled}
          >
            {changingPassword ? '변경중' : '변경'}
          </Button>
        </div>
      </div>
    </div>
  );
}
