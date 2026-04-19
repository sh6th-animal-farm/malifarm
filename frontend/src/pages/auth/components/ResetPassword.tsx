import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "@/components/common/Toast";
import ResetPasswordForm from "./ResetPasswordForm";
import { authApi } from "@/api/authApi";
import { validatePassword, type PasswordValidationResult } from "../hook/passwordValidation";

type LocationState = {
  email?: string;
  verificationCode?: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [email] = useState(state?.email ?? "");
  const [verificationCode] = useState(state?.verificationCode ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const passwordValidation = useMemo<PasswordValidationResult>(() => validatePassword(newPassword), [newPassword]);
  const passwordMatched = confirmPassword.length > 0 ? newPassword === confirmPassword : null;

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setError("");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setError("");
  };

  useEffect(() => {
    if (!state?.email || !state?.verificationCode) {
      navigate("/auth/find-password", { replace: true });
    }
  }, [navigate, state]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("새 비밀번호와 확인 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await authApi.resetPassword(email, verificationCode, newPassword, confirmPassword);
      setToastMessage("비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.");
      window.setTimeout(() => {
        navigate("/auth/login");
      }, 1200);
    } catch (err) {
      console.error("비밀번호 재설정 실패:", err);
      setError("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <ResetPasswordForm
        email={email}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        error={error}
        passwordValidation={passwordValidation}
        passwordMatched={passwordMatched}
        onChangeNewPassword={handleNewPasswordChange}
        onChangeConfirmPassword={handleConfirmPasswordChange}
        onSubmit={handleSubmit}
      />
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
