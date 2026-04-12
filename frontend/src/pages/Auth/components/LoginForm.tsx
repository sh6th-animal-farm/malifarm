import { Link } from "react-router-dom";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthCard from "@/components/common/AuthCard";

type LoginFormProps = {
  email: string;
  password: string;
  error: string;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function LoginForm({
  email,
  password,
  error,
  onChangeEmail,
  onChangePassword,
  onSubmit,
}: LoginFormProps) {
  return (
    <div className="flex min-h-[calc(100dvh-var(--spacing-header-height))] flex-col items-center justify-center px-6 py-10">
      
      <AuthCard
        title="로그인"
        description="마이리틀스마트팜에 오신 것을 환영합니다"
      >
        <form onSubmit={onSubmit}>
          
          {/* 이메일 */}
          <div className="mb-5">
            <label className="font-caption-03 text-gray-900">
              이메일 주소
            </label>
            <Input
              type="email"
              placeholder="example@farmpiece.com"
              required
              value={email}
              onChange={(e) => onChangeEmail(e.target.value)}
            />
          </div>

          {/* 비밀번호 */}
          <div className="mb-5">
            <label className="font-caption-03 text-gray-900">
              비밀번호
            </label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              value={password}
              onChange={(e) => onChangePassword(e.target.value)}
            />
            <div className="min-h-[24px] mt-2">
              {error && (
                <p className="font-caption-01 text-error">{error}</p>
              )}
            </div>
          </div>

          {/* 버튼 */}
          <Button variant="check" width="100%" type="submit">
            로그인
          </Button>
        </form>

        {/* 회원가입 */}
        <div className="mt-8 flex items-center justify-center font-caption-01 text-gray-500">
          <Link to="/auth/find-password" className="font-caption-01 text-gray-500">
            비밀번호 찾기
          </Link>
          <span className="mx-3 text-gray-300">|</span>
          <Link to="/auth/signup" className="font-caption-01 text-gray-500">
            회원가입
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
