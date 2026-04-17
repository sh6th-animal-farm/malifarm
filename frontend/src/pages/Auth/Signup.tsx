import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import apiClient from "@/api/apiClient";
import SignupAgreeStep from "./components/SignupAgreeStep";
import SignupProgress from "./components/SignupProgress";
import SignupSelect from "./components/SignupSelect";
import SignupEnterpriseStep from "./components/SignupEnterpriseStep";
import SignupPersonalStep, {
  type FormState,
  type SignUpType,
  type StatusState,
} from "./components/SignupPersonalStep";
import { validatePassword } from "./hook/passwordValidation";

type EnterpriseVerifyResponse = {
  verified: boolean;
  message?: string;
  companyName?: string;
};

type SignUpPayload = {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  brn?: string;
};

type SignupHistoryState = {
  signupForm?: FormState;
};

const EMAIL_EXPIRE_SEC = 300;

const initialFormState: FormState = {
  signUpType: null,
  step: 1,
  agreements: {
    service: false,
    privacy: false,
    push: false,
  },
  bNo: "",
  bNoVerified: false,
  cautionAgreed: false,
  phone: "",
  phoneVerified: false,
  email: "",
  emailCode: "",
  emailVerified: false,
  emailExpireAt: null,
  userName: "",
};

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailTimerRef = useRef<number | null>(null);
  const restoringRef = useRef(true);

  const [form, setForm] = useState<FormState>(initialFormState);

  const [bNoStatus, setBNoStatus] = useState<StatusState>({ msg: "", ok: null });
  const [cautionStatus, setCautionStatus] = useState<StatusState>({ msg: "", ok: null });
  const [phoneStatus, setPhoneStatus] = useState<StatusState>({ msg: "", ok: null });
  const [emailSendStatus, setEmailSendStatus] = useState<StatusState>({ msg: "", ok: null });
  const [emailVerifyStatus, setEmailVerifyStatus] = useState<StatusState>({ msg: "", ok: null });
  const [signupStatus, setSignupStatus] = useState<StatusState>({ msg: "", ok: null });

  const [emailRemainSec, setEmailRemainSec] = useState(0);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState({
    enterpriseVerify: false,
    emailConfirm: false,
    signup: false,
  });

  const totalSteps = form.signUpType === "PERSONAL" ? 5 : 7;

  const currentDotIndex = useMemo(() => {
    if (form.signUpType === "PERSONAL") {
      const map: Record<number, number> = { 1: 1, 4: 2, 5: 3, 6: 4, 7: 5 };
      return map[form.step] ?? 1;
    }
    return form.step;
  }, [form.signUpType, form.step]);

  const allChecked =
    form.agreements.service && form.agreements.privacy && form.agreements.push;
  const requiredChecked = form.agreements.service && form.agreements.privacy;

  const passwordMatched =
    password.length > 0 || password2.length > 0 ? password === password2 : null;

  const passwordValidation = validatePassword(password);

  useEffect(() => {
    const state = window.history.state as SignupHistoryState | null;
    const savedForm = state?.signupForm;

    if (savedForm) {
      const restoredExpireAt = savedForm.emailExpireAt;
      const restoredRemain = restoredExpireAt
        ? Math.max(0, Math.floor((restoredExpireAt - Date.now()) / 1000))
        : 0;

      setForm({
        ...savedForm,
        emailExpireAt: restoredRemain > 0 ? restoredExpireAt : null,
        emailVerified: savedForm.emailVerified,
      });
      setEmailRemainSec(restoredRemain);

      if (restoredExpireAt && restoredRemain <= 0 && !savedForm.emailVerified) {
        setEmailSendStatus({ msg: "인증번호가 만료되었습니다. 재전송해주세요.", ok: false });
      }
    }

    restoringRef.current = false;
  }, []);

  useEffect(() => {
    if (restoringRef.current) return;

    const prevState = (window.history.state ?? {}) as SignupHistoryState;
    window.history.replaceState(
      {
        ...prevState,
        signupForm: form,
      },
      ""
    );
  }, [form]);

  useEffect(() => {
    const expireAt = form.emailExpireAt;

    if (!expireAt) {
      if (emailTimerRef.current) {
        window.clearInterval(emailTimerRef.current);
        emailTimerRef.current = null;
      }
      setEmailRemainSec(0);
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

        setForm((prev) => ({
          ...prev,
          emailExpireAt: null,
          emailVerified: false,
        }));

        setEmailSendStatus({ msg: "인증번호가 만료되었습니다. 재전송해주세요.", ok: false });
      }
    };

    updateRemain();
    emailTimerRef.current = window.setInterval(updateRemain, 1000);

    return () => {
      if (emailTimerRef.current) {
        window.clearInterval(emailTimerRef.current);
        emailTimerRef.current = null;
      }
    };
  }, [form.emailExpireAt]);

  useEffect(() => {
    return () => {
      const currentPath = location.pathname;
      const nextState = window.history.state as SignupHistoryState | null;

      if (currentPath !== "/auth/signup") {
        return;
      }

      window.history.replaceState(
        {
          ...(nextState ?? {}),
          signupForm: undefined,
        },
        ""
      );
    };
  }, [location.pathname]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const formatMMSS = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const resetForm = (type: SignUpType) => {
    if (emailTimerRef.current) {
      window.clearInterval(emailTimerRef.current);
      emailTimerRef.current = null;
    }

    setForm({
      ...initialFormState,
      signUpType: type,
    });

    setBNoStatus({ msg: "", ok: null });
    setCautionStatus({ msg: "", ok: null });
    setPhoneStatus({ msg: "", ok: null });
    setEmailSendStatus({ msg: "", ok: null });
    setEmailVerifyStatus({ msg: "", ok: null });
    setSignupStatus({ msg: "", ok: null });
    setEmailRemainSec(0);
    setPassword("");
    setPassword2("");

    const prevState = (window.history.state ?? {}) as SignupHistoryState;
    window.history.replaceState(
      {
        ...prevState,
        signupForm: {
          ...initialFormState,
          signUpType: type,
        },
      },
      ""
    );
  };

  const startSignupFlow = (type: SignUpType) => {
    resetForm(type);
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateStep = () => {
    if (form.step === 1) {
      if (!requiredChecked) {
        return { ok: false, field: "terms", msg: "필수 약관에 동의해주세요." };
      }
      return { ok: true };
    }

    if (form.step === 2 && form.signUpType === "ENTERPRISE" && !form.bNoVerified) {
      return { ok: false, field: "bNo", msg: "사업자 인증이 필요합니다." };
    }

    if (form.step === 3 && form.signUpType === "ENTERPRISE" && !form.cautionAgreed) {
      return { ok: false, field: "caution", msg: "유의사항에 동의해주세요." };
    }

    if (form.step === 4 && !form.phoneVerified) {
      return { ok: false, field: "phone", msg: "본인인증을 완료해주세요." };
    }

    if (form.step === 5 && !form.emailVerified) {
      return { ok: false, field: "email", msg: "이메일 인증을 완료해주세요." };
    }

    return { ok: true };
  };

  const goToStepByDot = (dotIndex: number) => {
    setForm((prev) => {
      if (prev.signUpType === "PERSONAL") {
        const personalStepMap: Record<number, number> = {
          1: 1,
          2: 4,
          3: 5,
          4: 6,
          5: 7,
        };

        const nextStep = personalStepMap[dotIndex];
        if (!nextStep) return prev;

        return {
          ...prev,
          step: nextStep,
        };
      }

      const enterpriseStepMap: Record<number, number> = {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
      };

      const nextStep = enterpriseStepMap[dotIndex];
      if (!nextStep) return prev;

      return {
        ...prev,
        step: nextStep,
      };
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToNext = () => {
    const result = validateStep();

    if (!result.ok) {
      if (result.field === "bNo") setBNoStatus({ msg: result.msg!, ok: false });
      if (result.field === "caution") setCautionStatus({ msg: result.msg!, ok: false });
      if (result.field === "phone") setPhoneStatus({ msg: result.msg!, ok: false });
      if (result.field === "email") setEmailVerifyStatus({ msg: result.msg!, ok: false });
      return;
    }

    setForm((prev) => {
      if (prev.signUpType === "PERSONAL") {
        if (prev.step === 1) return { ...prev, step: 4 };
        if (prev.step < 7) return { ...prev, step: prev.step + 1 };
        return prev;
      }

      if (prev.step < 7) return { ...prev, step: prev.step + 1 };
      return prev;
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mockPhoneVerify = () => {
    const onlyNumber = form.phone.replace(/\D/g, "");
    if (onlyNumber.length <= 10) {
      setPhoneStatus({ msg: "휴대폰 번호를 입력해주세요.", ok: false });
      return;
    }

    updateForm("phoneVerified", true);
    setPhoneStatus({ msg: "본인인증이 완료되었습니다.", ok: true });
  };

  const onBnoChange = (value: string) => {
    updateForm("bNo", value.replace(/\D/g, "").slice(0, 10));
    updateForm("bNoVerified", false);
    setBNoStatus({ msg: "", ok: null });
  };

  const verifyBno = async () => {
    const cleaned = form.bNo.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setBNoStatus({ msg: "10자리(숫자)만 입력해주세요.", ok: false });
      updateForm("bNoVerified", false);
      return;
    }

    setLoading((prev) => ({ ...prev, enterpriseVerify: true }));
    setBNoStatus({ msg: "조회 중...", ok: null });

    try {
      const result = (await apiClient.post("/api/auth/enterprise/verification", {
        bNo: cleaned,
      })) as EnterpriseVerifyResponse;

      const ok = !!result?.verified;
      updateForm("bNoVerified", ok);
      setBNoStatus({
        msg: result?.message || (ok ? "인증되었습니다." : "인증 실패"),
        ok,
      });
    } catch (error) {
      console.error("사업자 인증 실패:", error);
      updateForm("bNoVerified", false);
      setBNoStatus({ msg: "사업자 인증에 실패했습니다.", ok: false });
    } finally {
      setLoading((prev) => ({ ...prev, enterpriseVerify: false }));
    }
  };

  const sendEmailCode = async () => {
    setEmailVerifyStatus({ msg: "", ok: null });

    if (!form.email.trim()) {
      setEmailSendStatus({ msg: "이메일을 입력해주세요.", ok: false });
      return;
    }

    if (!isValidEmail(form.email.trim())) {
      setEmailSendStatus({ msg: "유효한 이메일 주소를 입력해주세요.", ok: false });
      return;
    }

    try {
      await apiClient.post("/api/auth/email/verification", {
        email: form.email.trim(),
      });

      const expireAt = Date.now() + EMAIL_EXPIRE_SEC * 1000;

      setForm((prev) => ({
        ...prev,
        emailVerified: false,
        emailExpireAt: expireAt,
      }));
      setEmailRemainSec(EMAIL_EXPIRE_SEC);
      setEmailSendStatus({ msg: "인증번호를 발송했습니다. 메일을 확인해주세요.", ok: true });
    } catch (error) {
      console.error("이메일 인증번호 발송 실패:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409 || error.response?.status === 400) {
          setEmailSendStatus({ msg: "이미 가입된 이메일입니다.", ok: false });
        } else {
          setEmailSendStatus({ msg: "인증번호 발송에 실패했습니다.", ok: false });
        }
      } else {
        setEmailSendStatus({ msg: "인증번호 발송에 실패했습니다.", ok: false });
      }

      setForm((prev) => ({
        ...prev,
        emailVerified: false,
      }));
      setEmailRemainSec(0);

      if (emailTimerRef.current) {
        window.clearInterval(emailTimerRef.current);
        emailTimerRef.current = null;
      }
    }
  };

  const confirmEmailCode = async () => {
    if (!form.email.trim()) {
      setEmailVerifyStatus({ msg: "이메일을 먼저 입력해주세요.", ok: false });
      return;
    }

    if (!form.emailCode.trim()) {
      setEmailVerifyStatus({ msg: "인증번호를 입력해주세요.", ok: false });
      return;
    }

    setLoading((prev) => ({ ...prev, emailConfirm: true }));
    setEmailVerifyStatus({ msg: "", ok: null });

    try {
      await apiClient.post("/api/auth/email/verification/confirmation", {
        email: form.email.trim(),
        code: form.emailCode.trim(),
      });

      if (emailTimerRef.current) {
        window.clearInterval(emailTimerRef.current);
        emailTimerRef.current = null;
      }

      setForm((prev) => ({
        ...prev,
        emailVerified: true,
        emailExpireAt: null,
      }));
      setEmailVerifyStatus({ msg: "인증되었습니다.", ok: true });
      setEmailSendStatus({ msg: "", ok: null });
      setEmailRemainSec(0);
    } catch (error) {
      console.error("이메일 인증 확인 실패:", error);
      updateForm("emailVerified", false);
      setEmailVerifyStatus({ msg: "인증번호가 일치하지 않습니다.", ok: false });
    } finally {
      setLoading((prev) => ({ ...prev, emailConfirm: false }));
    }
  };

  const submitSignUp = async () => {
    setSignupStatus({ msg: "", ok: null });

    if (!form.emailVerified || !form.phoneVerified || passwordMatched !== true) {
      setSignupStatus({ msg: "입력값과 인증 상태를 다시 확인해주세요.", ok: false });
      return;
    }

    if (!form.userName.trim()) {
      setSignupStatus({ msg: "이름을 입력해주세요.", ok: false });
      return;
    }

    if (!passwordValidation.isValid) {
      setSignupStatus({ msg: passwordValidation.message, ok: false });
      return;
    }

    const payload: SignUpPayload = {
      userName: form.userName.trim(),
      email: form.email.trim(),
      password,
      phoneNumber: form.phone.replace(/\D/g, ""),
    };

    if (form.signUpType === "ENTERPRISE") {
      payload.brn = form.bNo.replace(/\D/g, "");
    }

    setLoading((prev) => ({ ...prev, signup: true }));
    setSignupStatus({ msg: "처리 중...", ok: null });

    try {
      await apiClient.post("/api/auth/signup", payload);

      const prevState = (window.history.state ?? {}) as SignupHistoryState;
      window.history.replaceState(
        {
          ...prevState,
          signupForm: undefined,
        },
        ""
      );

      setPassword("");
      setPassword2("");
      setForm((prev) => ({ ...prev, step: 7, emailExpireAt: null }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("회원가입 실패:", error);
      setSignupStatus({ msg: "회원가입에 실패했습니다.", ok: false });
    } finally {
      setLoading((prev) => ({ ...prev, signup: false }));
    }
  };

  const renderStatus = (status: StatusState) => {
    if (!status.msg) return <div className="min-h-[20px] mt-2" />;

    const color =
      status.ok === true
        ? "text-[var(--color-success)]"
        : status.ok === false
          ? "text-[var(--color-error)]"
          : "text-gray-500";

    return (
      <div className={`min-h-[20px] mt-2 flex items-center gap-2 text-[13px] font-medium ${color}`}>
        <span>{status.msg}</span>
      </div>
    );
  };

  if (!form.signUpType) {
    return (
      <SignupSelect
        onSelect={startSignupFlow}
        onGoLogin={() => navigate("/auth/login")}
      />
    );
  }

  return (
    <main className="flex min-h-[calc(100dvh-var(--spacing-header-height))] flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-[520px]">
        <SignupProgress
          totalSteps={totalSteps}
          currentDotIndex={currentDotIndex}
          onStepClick={goToStepByDot}
        />

        {form.step === 1 && (
          <SignupAgreeStep
            agreements={form.agreements}
            allChecked={allChecked}
            onToggleAll={(checked) =>
              updateForm("agreements", {
                service: checked,
                privacy: checked,
                push: checked,
              })
            }
            onToggleOne={(key, checked) =>
              updateForm("agreements", {
                ...form.agreements,
                [key]: checked,
              })
            }
            onNext={goToNext}
          />
        )}

        {form.signUpType === "PERSONAL" && form.step >= 4 && (
          <SignupPersonalStep
            form={form}
            updateForm={updateForm}
            goToNext={goToNext}
            phoneStatus={phoneStatus}
            emailSendStatus={emailSendStatus}
            emailVerifyStatus={emailVerifyStatus}
            signupStatus={signupStatus}
            password={password}
            password2={password2}
            passwordMatched={passwordMatched}
            passwordValidation={passwordValidation}
            emailRemainSec={emailRemainSec}
            loading={{
              emailConfirm: loading.emailConfirm,
              signup: loading.signup,
            }}
            setPassword={setPassword}
            setPassword2={setPassword2}
            setPhoneStatus={setPhoneStatus}
            setEmailSendStatus={setEmailSendStatus}
            setEmailVerifyStatus={setEmailVerifyStatus}
            setSignupStatus={setSignupStatus}
            mockPhoneVerify={mockPhoneVerify}
            sendEmailCode={sendEmailCode}
            confirmEmailCode={confirmEmailCode}
            submitSignUp={submitSignUp}
            formatMMSS={formatMMSS}
            renderStatus={renderStatus}
          />
        )}

        {form.signUpType === "ENTERPRISE" && form.step >= 2 && (
          <SignupEnterpriseStep
            form={form}
            updateForm={updateForm}
            goToNext={goToNext}
            bNoStatus={bNoStatus}
            cautionStatus={cautionStatus}
            phoneStatus={phoneStatus}
            emailSendStatus={emailSendStatus}
            emailVerifyStatus={emailVerifyStatus}
            signupStatus={signupStatus}
            password={password}
            password2={password2}
            passwordMatched={passwordMatched}
            passwordValidation={passwordValidation}
            emailRemainSec={emailRemainSec}
            loading={loading}
            setPassword={setPassword}
            setPassword2={setPassword2}
            setCautionStatus={setCautionStatus}
            setPhoneStatus={setPhoneStatus}
            setEmailSendStatus={setEmailSendStatus}
            setEmailVerifyStatus={setEmailVerifyStatus}
            setSignupStatus={setSignupStatus}
            onBnoChange={onBnoChange}
            verifyBno={verifyBno}
            mockPhoneVerify={mockPhoneVerify}
            sendEmailCode={sendEmailCode}
            confirmEmailCode={confirmEmailCode}
            submitSignUp={submitSignUp}
            formatMMSS={formatMMSS}
            renderStatus={renderStatus}
          />
        )}
      </div>
    </main>
  );
}