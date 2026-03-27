import { Link } from "react-router-dom";
import Button from "@/components/common/button";
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
    <div className="flex flex-col items-center px-6 pt-20 pb-20 min-h-[calc(80vh-var(--spacing-header-height))]">
      
      <AuthCard
        title="로그인"
        description="팜조각에 오신 것을 환영합니다"
      >
        <form onSubmit={onSubmit}>
          
          {/* 이메일 */}
          <div className="mb-5">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
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
          <div className="mb-8">
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
              비밀번호
            </label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              value={password}
              onChange={(e) => onChangePassword(e.target.value)}
            />
          </div>

          {/* 에러 */}
          {error && (
            <p className="mt-1 text-[14px] text-[#d32f2f]">{error}</p>
          )}

          {/* 버튼 */}
          <Button variant="check" width="100%" type="submit">
            로그인
          </Button>
        </form>

        {/* 회원가입 */}
        <div className="mt-8 text-center text-[14px] text-gray-500">
          계정이 없으신가요?
          <Link to="/auth/signup" className="ml-1 font-bold text-green-600">
            회원가입
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}