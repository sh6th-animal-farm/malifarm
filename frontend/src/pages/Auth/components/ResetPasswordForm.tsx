import { Link } from "react-router-dom";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthCard from "@/components/common/AuthCard";

type ResetPasswordFormProps = {
  email: string;
  newPassword: string;
  confirmPassword: string;
  error: string;
  passwordValidation: {
    isValid: boolean;
    message: string;
  };
  passwordMatched: boolean | null;
  onChangeNewPassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function ResetPasswordForm({
  email,
  newPassword,
  confirmPassword,
  error,
  passwordValidation,
  passwordMatched,
  onChangeNewPassword,
  onChangeConfirmPassword,
  onSubmit,
}: ResetPasswordFormProps) {
  return (
    <div className="flex min-h-[calc(100dvh-var(--spacing-header-height))] flex-col items-center justify-center px-6 py-10">
      <AuthCard
        title="비밀번호 재설정"
        description="이메일 인증 후 새 비밀번호를 설정하세요."
      >
        <form onSubmit={onSubmit}>
          <div className="mb-5">
            <label className="font-caption-03 text-gray-900">
              이메일 주소
            </label>
            <Input
              type="email"
              value={email}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="mb-5">
            <label className="font-caption-03 text-gray-900">
              새 비밀번호
            </label>
            <Input
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              required
              value={newPassword}
              onChange={(e) => onChangeNewPassword(e.target.value)}
            />
            <div className="mt-2">
              {newPassword.length > 0 && (
                <p
                  className={`font-caption-01 ${passwordValidation.isValid ? "text-green-600" : "text-error"}`}
                >
                  {passwordValidation.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label className="font-caption-03 text-gray-900">
              비밀번호 확인
            </label>
            <Input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              required
              value={confirmPassword}
              onChange={(e) => onChangeConfirmPassword(e.target.value)}
            />
            <div className="min-h-[24px] mt-2">
              {passwordMatched !== null && (
                <p
                  className={`font-caption-01 ${passwordMatched ? "text-green-600" : "text-error"}`}
                >
                  {passwordMatched ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4">
              <p className="font-caption-01 text-error">{error}</p>
            </div>
          )}

          <Button variant="check" width="100%" type="submit">
            비밀번호 변경
          </Button>
        </form>

        <div className="font-caption-01 mt-8 text-center text-gray-500">
          로그인 페이지로 돌아가시겠어요?
          <Link to="/auth/login" className="font-caption-03 ml-1 text-green-600">
            로그인
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
