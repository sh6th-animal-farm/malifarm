import { Link } from "react-router-dom";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthCard from "@/components/common/AuthCard";

type FindPasswordFormProps = {
  email: string;
  verificationCode: string;
  error: string;
  success: string;
  emailMessage: string;
  isCodeVerified: boolean;
  emailRemainSec: number;
  formatMMSS: (sec: number) => string;
  onChangeEmail: (value: string) => void;
  onChangeVerificationCode: (value: string) => void;
  onSendCode: () => void;
  onVerifyCode: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function FindPasswordForm({
  email,
  verificationCode,
  error,
  success,
  emailMessage,
  isCodeVerified,
  emailRemainSec,
  formatMMSS,
  onChangeEmail,
  onChangeVerificationCode,
  onSendCode,
  onVerifyCode,
  onSubmit,
}: FindPasswordFormProps) {
  return (
    <div className="flex flex-col items-center px-6 py-10 min-h-[calc(75vh-var(--spacing-header-height))] bg-gray-50">
      <AuthCard
        title="비밀번호 찾기"
        description="이메일 인증 후 새로운 비밀번호를 설정합니다"
      >
        <form onSubmit={onSubmit}>
          {/* 이메일 */}
          <div className="mb-5">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
              이메일 주소
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="email"
                  placeholder="example@farmpiece.com"
                  required
                  value={email}
                  onChange={(e) => onChangeEmail(e.target.value)}
                  className="pr-20"
                />
                {emailRemainSec > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-red-500 font-semibold">
                    {formatMMSS(emailRemainSec)}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="px-5 h-12 bg-gray-900 text-white rounded-[8px] font-semibold whitespace-nowrap"
                onClick={onSendCode}
              >
                {emailRemainSec > 0 ? "재전송" : "코드 발송"}
              </button>
            </div>
            {emailMessage && (
              <p className="mt-2 text-[14px] text-green-600">{emailMessage}</p>
            )}
          </div>

          {/* 인증코드 */}
          <div className="mb-10">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
              인증코드
            </label>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="인증코드를 입력하세요"
                required
                value={verificationCode}
                onChange={(e) =>
                  onChangeVerificationCode(e.target.value)
                }
                className="flex-1"
              />

              <button
                type="button"
                className="px-5 h-12 bg-gray-900 text-white rounded-[8px] font-semibold whitespace-nowrap"
                onClick={onVerifyCode}
                disabled={!verificationCode}
              >
                확인
              </button>
            </div>
            {(error || success) && (
              <p className={`mt-2 text-[14px] ${error ? "text-red-600" : "text-green-600"}`}>
                {error || success}
              </p>
            )}
          </div>

          {/* 메인 버튼 (기존 유지) */}
          <Button
            variant="check"
            width="100%"
            type="submit"
            disabled={!isCodeVerified}
          >
            다음
          </Button>
        </form>

        {/* 하단 링크 */}
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