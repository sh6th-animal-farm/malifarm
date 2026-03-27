import {useState} from "react";
import {useNavigate} from "react-router-dom";
import apiClient from "@/api/apiClient";
import {authApi} from "@/api/authApi";
import LoginForm from "@/pages/auth/components/LoginForm.tsx";

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
