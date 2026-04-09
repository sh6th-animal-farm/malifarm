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
    <div className="flex flex-col items-center px-6 py-10 min-h-[calc(75vh-var(--spacing-header-height))] bg-gray-50">
      <AuthCard
        title="비밀번호 재설정"
        description="이메일 인증 후 새 비밀번호를 설정하세요."
      >
        <form onSubmit={onSubmit}>
          <div className="mb-5">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
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
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
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
                  className={`text-[14px] ${passwordValidation.isValid ? "text-green-600" : "text-red-600"}`}
                >
                  {passwordValidation.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
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
                  className={`text-[14px] ${passwordMatched ? "text-green-600" : "text-red-600"}`}
                >
                  {passwordMatched ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4">
              <p className="text-[14px] text-red-600">{error}</p>
            </div>
          )}

          <Button variant="check" width="100%" type="submit">
            비밀번호 변경
          </Button>
        </form>

        <div className="mt-8 text-center text-[14px] text-gray-500">
          로그인 페이지로 돌아가시겠어요?
          <Link to="/auth/login" className="ml-1 font-bold text-green-600">
            로그인
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
