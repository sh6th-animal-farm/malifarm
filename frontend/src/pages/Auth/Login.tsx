import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/apiClient";
import LoginForm from "./components/LoginForm";
import { authApi } from "@/api/authApi";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

    try {
      const loginData = (await apiClient.post("/api/auth/login", {
        email,
        password,
      })) as LoginResponse;

      localStorage.setItem("accessToken", loginData.accessToken);
      localStorage.setItem("refreshToken", loginData.refreshToken);

      const userName = await authApi.getUserName();
      const userRole = await authApi.getUserRole();

      localStorage.setItem("userName", userName);
      localStorage.setItem("userRole", userRole);

            const now = Date.now().toString();
            localStorage.setItem("loginStartTime", now);
            localStorage.setItem("lastActivityTime", now);

      navigate("/");
    } catch (err) {
      console.error("로그인 실패:", err);
      setError("이메일 또는 비밀번호를 확인하세요.");
    }
  };

    return (
        <div className="flex flex-col items-center px-6 pt-10 pb-20 min-h-[calc(100vh-var(--spacing-header-height))]">
            <div className="w-full max-w-[520px]">
                <div
                    className="bg-white p-10 rounded-[var(--radius-l)] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <h2 className="text-center text-[24px] leading-[1.4] font-bold text-gray-900 mb-3">
                        로그인
                    </h2>

                    <p className="text-center text-[14px] leading-[1.5] text-gray-500 mb-8">
                        팜조각에 오신 것을 환영합니다
                    </p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-5">
                            <label className="block text-[14px] font-bold text-gray-900 mb-2">
                                이메일 주소
                            </label>
                            <input
                                type="email"
                                placeholder="example@farmpiece.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-[50px] px-4 border border-gray-200 rounded-[var(--radius-m)] text-[15px] text-gray-900 bg-white transition-colors focus:outline-none focus:border-green-600"
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block text-[14px] font-bold text-gray-900 mb-2">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-[50px] px-4 border border-gray-200 rounded-[var(--radius-m)] text-[15px] text-gray-900 bg-white transition-colors focus:outline-none focus:border-green-600"
                            />
                        </div>

                        {error && (
                            <p className="mt-1 text-[14px] text-[#d32f2f]">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full h-[54px] mt-5 bg-green-600 hover:bg-green-800 text-white text-[16px] font-bold rounded-[var(--radius-m)] transition-colors"
                        >
                            로그인
                        </button>
                    </form>

                    <div className="mt-8 text-center text-[14px] text-gray-500">
                        계정이 없으신가요?
                        <Link
                            to="/auth/signup"
                            className="ml-1 font-bold text-green-600"
                        >
                            회원가입
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
  return (
    <LoginForm
      email={email}
      password={password}
      error={error}
      onChangeEmail={setEmail}
      onChangePassword={setPassword}
      onSubmit={handleLogin}
    />
  );
}
