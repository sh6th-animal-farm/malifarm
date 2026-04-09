import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import FindPasswordForm from "./FindPasswordForm";

const EMAIL_EXPIRE_SEC = 300; // 5분

export default function FindPassword() {
  const navigate = useNavigate();
  const emailTimerRef = useRef<number | null>(null);

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [emailExpireAt, setEmailExpireAt] = useState<number | null>(null);
  const [emailRemainSec, setEmailRemainSec] = useState(0);

  const formatMMSS = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    const expireAt = emailExpireAt;

    if (!expireAt) {
      if (emailTimerRef.current) {
        window.clearInterval(emailTimerRef.current);
        emailTimerRef.current = null;
      }
      return;
    }

    const updateRemain = () => {
      const remain = Math.max(0, Math.floor((expireAt - Date.now()) / 1000));
      setEmailRemainSec(remain);

      if (remain <= 0) {
        if (emailTimerRef.current) {
          window.clearInterval(emailTimerRef.current);
          emailTimerRef.current = null;
        }

        setEmailExpireAt(null);
        setEmailRemainSec(0);
        setEmailMessage("인증번호가 만료되었습니다. 재전송해주세요.");
        setIsCodeVerified(false);
      }
    };

    emailTimerRef.current = window.setInterval(updateRemain, 1000);

    return () => {
      if (emailTimerRef.current) {
        window.clearInterval(emailTimerRef.current);
        emailTimerRef.current = null;
      }
    };
  }, [emailExpireAt]);

  const handleSendCode = async () => {
    setError("");
    setSuccess("");
    setEmailMessage("");
    setIsCodeVerified(false);

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    try {
      await authApi.sendPasswordResetCode(email);
      const expireAt = Date.now() + EMAIL_EXPIRE_SEC * 1000;
      setEmailExpireAt(expireAt);
      setEmailRemainSec(EMAIL_EXPIRE_SEC);
      setEmailMessage("인증 코드가 발송되었습니다. 이메일을 확인해주세요.");
    } catch (err) {
      console.error("비밀번호 재설정 코드 발송 실패:", err);
      setError("유효한 이메일을 입력하고 다시 시도해주세요.");
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setSuccess("");

    if (!email || !verificationCode) {
      setError("이메일과 인증 코드를 모두 입력해주세요.");
      return;
    }

    try {
      await authApi.verifyPasswordResetCode(email, verificationCode);
      setIsCodeVerified(true);
      setSuccess("인증 코드가 확인되었습니다. 다음 단계로 이동하세요.");
    } catch (err) {
      console.error("인증 코드 확인 실패:", err);
      setError("인증 코드가 올바르지 않습니다. 다시 확인해주세요.");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!isCodeVerified) {
      setError("인증 코드를 확인한 후 다음 단계로 이동해주세요.");
      return;
    }

    navigate("/auth/reset-password", {
      state: { email, verificationCode },
    });
  };

  return (
    <FindPasswordForm
      email={email}
      verificationCode={verificationCode}
      error={error}
      success={success}
      emailMessage={emailMessage}
      isCodeVerified={isCodeVerified}
      emailRemainSec={emailRemainSec}
      formatMMSS={formatMMSS}
      onChangeEmail={setEmail}
      onChangeVerificationCode={setVerificationCode}
      onSendCode={handleSendCode}
      onVerifyCode={handleVerifyCode}
      onSubmit={handleSubmit}
    />
  );
}