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
    <div className="flex min-h-[calc(100dvh-var(--spacing-header-height))] flex-col items-center justify-center bg-gray-50 px-6 py-10">
      <AuthCard
        title="비밀번호 찾기"
        description="이메일 인증 후 새로운 비밀번호를 설정합니다"
      >
        <form onSubmit={onSubmit}>
          {/* 이메일 */}
          <div className="mb-5">
            <label className="font-caption-03 text-gray-900">
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
                  <span className="font-caption-02 text-error absolute top-1/2 right-4 -translate-y-1/2">
                    {formatMMSS(emailRemainSec)}
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="default"
                width="auto"
                height={50}
                className="px-5 whitespace-nowrap font-button-02"
                onClick={onSendCode}
              >
                {emailRemainSec > 0 ? "재전송" : "코드 발송"}
              </Button>
            </div>
            {emailMessage && (
              <p className="font-caption-01 mt-2 text-green-600">{emailMessage}</p>
            )}
          </div>

          {/* 인증코드 */}
          <div className="mb-10">
            <label className="font-caption-03 text-gray-900">
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

              <Button
                type="button"
                variant="default"
                width="auto"
                height={50}
                className="px-5 whitespace-nowrap font-button-02"
                onClick={onVerifyCode}
                disabled={!verificationCode}
              >
                확인
              </Button>
            </div>
            {(error || success) && (
              <p
                className={`font-caption-01 mt-2 ${error ? "text-error" : "text-green-600"}`}
              >
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
