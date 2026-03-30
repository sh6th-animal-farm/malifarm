import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/apiClient";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import {
  CheckCircle,
  WarningCircle,
  PersonalUser,
  EnterpriseUser,
} from "@/components/icon/Icons";

type SignUpType = "PERSONAL" | "ENTERPRISE" | null;

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

const EMAIL_EXPIRE_SEC = 300;

export default function Signup() {
  const navigate = useNavigate();

  const [signUpType, setSignUpType] = useState<SignUpType>(null);
  const [step, setStep] = useState(1);

  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    push: false,
  });

  const [bNo, setBNo] = useState("");
  const [bNoVerified, setBNoVerified] = useState(false);
  const [bNoStatus, setBNoStatus] = useState<{ msg: string; ok: boolean | null }>({
    msg: "",
    ok: null,
  });

  const [cautionAgreed, setCautionAgreed] = useState(false);
  const [cautionStatus, setCautionStatus] = useState<{ msg: string; ok: boolean | null }>({
    msg: "",
    ok: null,
  });

  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<{ msg: string; ok: boolean | null }>({
    msg: "",
    ok: null,
  });

  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailSendStatus, setEmailSendStatus] = useState<{ msg: string; ok: boolean | null }>({
    msg: "",
    ok: null,
  });
  const [emailVerifyStatus, setEmailVerifyStatus] = useState<{ msg: string; ok: boolean | null }>(
    {
      msg: "",
      ok: null,
    }
  );
  const [emailRemainSec, setEmailRemainSec] = useState(0);
  const emailTimerRef = useRef<number | null>(null);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [signupStatus, setSignupStatus] = useState<{ msg: string; ok: boolean | null }>({
    msg: "",
    ok: null,
  });

  const [loading, setLoading] = useState({
    enterpriseVerify: false,
    emailSend: false,
    emailConfirm: false,
    signup: false,
  });

  const totalSteps = signUpType === "PERSONAL" ? 5 : 7;

  const currentDotIndex = useMemo(() => {
    if (signUpType === "PERSONAL") {
      const map: Record<number, number> = { 1: 1, 4: 2, 5: 3, 6: 4, 7: 5 };
      return map[step] ?? 1;
    }
    return step;
  }, [signUpType, step]);

  useEffect(() => {
    if (emailRemainSec <= 0) {
      if (emailTimerRef.current) {
        window.clearInterval(emailTimerRef.current);
        emailTimerRef.current = null;
      }
      return;
    }

    emailTimerRef.current = window.setInterval(() => {
      setEmailRemainSec((prev) => {
        if (prev <= 1) {
          if (emailTimerRef.current) {
            window.clearInterval(emailTimerRef.current);
            emailTimerRef.current = null;
          }
          setEmailVerified(false);
          setEmailSendStatus({ msg: "인증번호가 만료되었습니다. 재전송해주세요.", ok: false });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (emailTimerRef.current) {
        window.clearInterval(emailTimerRef.current);
        emailTimerRef.current = null;
      }
    };
  }, [emailRemainSec]);

  const formatMMSS = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const resetForm = () => {
    setStep(1);
    setAgreements({ service: false, privacy: false, push: false });

    setBNo("");
    setBNoVerified(false);
    setBNoStatus({ msg: "", ok: null });

    setCautionAgreed(false);
    setCautionStatus({ msg: "", ok: null });

    setPhone("");
    setPhoneVerified(false);
    setPhoneStatus({ msg: "", ok: null });

    setEmail("");
    setEmailCode("");
    setEmailVerified(false);
    setEmailSendStatus({ msg: "", ok: null });
    setEmailVerifyStatus({ msg: "", ok: null });
    setEmailRemainSec(0);

    setUserName("");
    setPassword("");
    setPassword2("");
    setSignupStatus({ msg: "", ok: null });
  };

  const startSignupFlow = (type: SignUpType) => {
    setSignUpType(type);
    resetForm();
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const allChecked = agreements.service && agreements.privacy && agreements.push;
  const requiredChecked = agreements.service && agreements.privacy;

  const passwordMatched =
    password.length > 0 || password2.length > 0 ? password === password2 : null;

  const validateStep = () => {
    if (step === 1) {
      if (!requiredChecked) {
        return { ok: false, field: "terms", msg: "필수 약관에 동의해주세요." };
      }
      return { ok: true };
    }

    if (step === 2 && signUpType === "ENTERPRISE" && !bNoVerified) {
      return { ok: false, field: "bNo", msg: "사업자 인증이 필요합니다." };
    }

    if (step === 3 && signUpType === "ENTERPRISE" && !cautionAgreed) {
      return { ok: false, field: "caution", msg: "유의사항에 동의해주세요." };
    }

    if (step === 4 && !phoneVerified) {
      return { ok: false, field: "phone", msg: "본인인증을 완료해주세요." };
    }

    if (step === 5 && !emailVerified) {
      return { ok: false, field: "email", msg: "이메일 인증을 완료해주세요." };
    }

    return { ok: true };
  };

  const goToNext = () => {
    const result = validateStep();

    if (!result.ok) {
      if (result.field === "terms") {
        setSignupStatus({ msg: "", ok: null });
      }
      if (result.field === "bNo") {
        setBNoStatus({ msg: result.msg!, ok: false });
      }
      if (result.field === "caution") {
        setCautionStatus({ msg: result.msg!, ok: false });
      }
      if (result.field === "phone") {
        setPhoneStatus({ msg: result.msg!, ok: false });
      }
      if (result.field === "email") {
        setEmailVerifyStatus({ msg: result.msg!, ok: false });
      }
      return;
    }

    if (signUpType === "PERSONAL") {
      if (step === 1) setStep(4);
      else if (step < 7) setStep((prev) => prev + 1);
    } else {
      if (step < 7) setStep((prev) => prev + 1);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mockPhoneVerify = () => {
    const onlyNumber = phone.replace(/\D/g, "");
    if (onlyNumber.length < 10) {
      setPhoneStatus({ msg: "휴대폰 번호를 입력해주세요.", ok: false });
      return;
    }
    setPhoneVerified(true);
    setPhoneStatus({ msg: "본인인증이 완료되었습니다.", ok: true });
  };

  const onBnoChange = (value: string) => {
    setBNo(value.replace(/\D/g, "").slice(0, 10));
    setBNoVerified(false);
    setBNoStatus({ msg: "", ok: null });
  };

  const verifyBno = async () => {
    const cleaned = bNo.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setBNoStatus({ msg: "10자리(숫자)만 입력해주세요.", ok: false });
      setBNoVerified(false);
      return;
    }

    setLoading((prev) => ({ ...prev, enterpriseVerify: true }));
    setBNoStatus({ msg: "조회 중...", ok: null });

    try {
      const result = (await apiClient.post("/api/auth/enterprise/verification", {
        bNo: cleaned,
      })) as EnterpriseVerifyResponse;

      const ok = !!result?.verified;
      setBNoVerified(ok);
      setBNoStatus({
        msg: result?.message || (ok ? "인증되었습니다." : "인증 실패"),
        ok,
      });
    } catch (error) {
      console.error("사업자 인증 실패:", error);
      setBNoVerified(false);
      setBNoStatus({ msg: "사업자 인증에 실패했습니다.", ok: false });
    } finally {
      setLoading((prev) => ({ ...prev, enterpriseVerify: false }));
    }
  };

  const sendEmailCode = async () => {
    setEmailVerified(false);
    setEmailVerifyStatus({ msg: "", ok: null });

    if (!email.trim()) {
      setEmailSendStatus({ msg: "이메일을 입력해주세요.", ok: false });
      return;
    }
    if (!isValidEmail(email.trim())) {
      setEmailSendStatus({ msg: "유효한 이메일 주소를 입력해주세요.", ok: false });
      return;
    }

    setLoading((prev) => ({ ...prev, emailSend: true }));
    setEmailSendStatus({ msg: "전송 중...", ok: null });

    try {
      await apiClient.post("/api/auth/email/verification", {
        email: email.trim(),
      });

      setEmailSendStatus({ msg: "인증번호가 메일로 발송되었습니다.", ok: true });
      setEmailRemainSec(EMAIL_EXPIRE_SEC);
    } catch (error) {
      console.error("이메일 인증번호 발송 실패:", error);
      setEmailSendStatus({ msg: "인증번호 발송에 실패했습니다.", ok: false });
      setEmailRemainSec(0);
    } finally {
      setLoading((prev) => ({ ...prev, emailSend: false }));
    }
  };

  const confirmEmailCode = async () => {
    if (!email.trim()) {
      setEmailVerifyStatus({ msg: "이메일을 먼저 입력해주세요.", ok: false });
      return;
    }
    if (!emailCode.trim()) {
      setEmailVerifyStatus({ msg: "인증번호를 입력해주세요.", ok: false });
      return;
    }

    setLoading((prev) => ({ ...prev, emailConfirm: true }));
    setEmailVerifyStatus({ msg: "", ok: null });

    try {
      await apiClient.post("/api/auth/email/verification/confirmation", {
        email: email.trim(),
        code: emailCode.trim(),
      });

      if (emailTimerRef.current) {
        window.clearInterval(emailTimerRef.current);
        emailTimerRef.current = null;
      }

      setEmailVerified(true);
      setEmailVerifyStatus({ msg: "인증되었습니다.", ok: true });
      setEmailSendStatus({ msg: "", ok: null }); // 만료 문구 제거
      setEmailRemainSec(0);
    } catch (error) {
      console.error("이메일 인증 확인 실패:", error);
      setEmailVerified(false);
      setEmailVerifyStatus({ msg: "인증번호가 일치하지 않습니다.", ok: false });
    } finally {
      setLoading((prev) => ({ ...prev, emailConfirm: false }));
    }
  };

  const submitSignUp = async () => {
    setSignupStatus({ msg: "", ok: null });

    if (!emailVerified || !phoneVerified || passwordMatched !== true) {
      setSignupStatus({ msg: "입력값과 인증 상태를 다시 확인해주세요.", ok: false });
      return;
    }

    if (!userName.trim()) {
      setSignupStatus({ msg: "이름을 입력해주세요.", ok: false });
      return;
    }

    const payload: SignUpPayload = {
      userName: userName.trim(),
      email: email.trim(),
      password,
      phoneNumber: phone.replace(/\D/g, ""),
    };

    if (signUpType === "ENTERPRISE") {
      payload.brn = bNo.replace(/\D/g, "");
    }

    setLoading((prev) => ({ ...prev, signup: true }));
    setSignupStatus({ msg: "처리 중...", ok: null });

    try {
      await apiClient.post("/api/auth/signup", payload);
      setStep(7);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("회원가입 실패:", error);
      setSignupStatus({ msg: "회원가입에 실패했습니다.", ok: false });
    } finally {
      setLoading((prev) => ({ ...prev, signup: false }));
    }
  };

  const renderStatus = (status: { msg: string; ok: boolean | null }) => {
    if (!status.msg) return <div className="min-h-[20px] mt-2" />;

    const color =
      status.ok === true
        ? "text-[var(--color-success)]"
        : status.ok === false
          ? "text-[var(--color-error)]"
          : "text-gray-500";

    return (
      <div className={`min-h-[20px] mt-2 flex items-center gap-2 text-[13px] font-medium ${color}`}>
        {status.ok === true && <CheckCircle className="w-4 h-4 shrink-0" />}
        {status.ok === false && <WarningCircle className="w-4 h-4 shrink-0" />}
        <span>{status.msg}</span>
      </div>
    );
  };

  const labelClassName = "block mb-2 text-[14px] font-semibold text-gray-900";

  if (!signUpType) {
    return (
      <main className="flex-1 flex flex-col min-h-[calc(80vh-var(--spacing-header-height))] items-center py-10 pt-30 bg-gray-50">
        <div className="w-full max-w-[520px] bg-white p-10 rounded-[var(--radius-m)] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
          <h2 className="text-center text-[24px] font-bold text-gray-900 mb-3">회원가입</h2>
          <p className="text-center text-[14px] text-gray-500 mb-8">
            가입하실 회원 유형을 선택해주세요
          </p>

          <button
            type="button"
            onClick={() => startSignupFlow("PERSONAL")}
            className="w-full p-6 border border-gray-200 rounded-[12px] flex items-center gap-5 bg-white mb-4 text-left hover:border-green-500 transition-colors"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
              <PersonalUser className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-[17px] font-bold text-gray-900 mb-1">개인 회원</h4>
              <p className="text-[14px] text-gray-500">일반 투자 및 서비스를 이용하는 개인</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => startSignupFlow("ENTERPRISE")}
            className="w-full p-6 border border-gray-200 rounded-[12px] flex items-center gap-5 bg-white text-left hover:border-green-500 transition-colors"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
              <EnterpriseUser className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-[17px] font-bold text-gray-900 mb-1">기업 회원</h4>
              <p className="text-[14px] text-gray-500">법인 및 사업자 명의 투자 서비스 이용</p>
            </div>
          </button>

          <div className="mt-6 text-center text-[14px] text-gray-500">
            이미 회원이신가요?{" "}
            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="text-green-600 font-bold"
            >
              로그인
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center py-10 bg-gray-50">
      <div className="w-full max-w-[520px]">
        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                currentDotIndex === idx + 1 ? "w-6 bg-green-600" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="bg-white p-10 rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
          {step === 1 && (
            <section>
              <h2 className="text-center text-[24px] font-bold text-gray-900 mb-3">약관 동의</h2>
              <p className="text-center text-[14px] text-gray-500 mb-8">
                원활한 서비스 이용을 위해 약관에 동의해주세요
              </p>

              <div className="border border-gray-200 rounded-[8px] p-5">
                <label className="flex items-center gap-2 pb-4 border-b border-gray-200 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) =>
                      setAgreements({
                        service: e.target.checked,
                        privacy: e.target.checked,
                        push: e.target.checked,
                      })
                    }
                  />
                  <span className="font-bold text-gray-900">약관 전체 동의</span>
                </label>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements.service}
                    onChange={(e) =>
                      setAgreements((prev) => ({ ...prev, service: e.target.checked }))
                    }
                  />
                  <span>[필수] 서비스 이용약관 동의</span>
                </label>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={(e) =>
                      setAgreements((prev) => ({ ...prev, privacy: e.target.checked }))
                    }
                  />
                  <span>[필수] 개인정보 수집 및 이용 동의</span>
                </label>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements.push}
                    onChange={(e) =>
                      setAgreements((prev) => ({ ...prev, push: e.target.checked }))
                    }
                  />
                  <span>[선택] 푸시 알람 수신 동의</span>
                </label>
              </div>

              <div className="pb-10" />

              <Button type="button" variant="check" width="100%" height={50} onClick={goToNext}>
                다음으로
              </Button>
            </section>
          )}

          {step === 2 && signUpType === "ENTERPRISE" && (
            <section>
              <h2 className="text-center text-[24px] font-bold text-gray-900 mb-3">기업 인증</h2>
              <p className="text-center text-[14px] text-gray-500 mb-8">
                사업자 등록번호를 확인합니다
              </p>

              <div className="mb-5">
                <label className={labelClassName}>사업자 등록번호</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={bNo}
                    onChange={(e) => onBnoChange(e.target.value)}
                    placeholder="숫자만 입력 (10자리)"
                    maxLength={10}
                    height={50}
                  />
                  <button
                    type="button"
                    className="px-5 h-[50px] bg-gray-900 text-white rounded-[8px] font-semibold whitespace-nowrap"
                    onClick={verifyBno}
                    disabled={loading.enterpriseVerify}
                  >
                    {loading.enterpriseVerify ? "조회 중..." : "인증하기"}
                  </button>
                </div>
                {renderStatus(bNoStatus)}
              </div>

              <Button type="button" variant="check" width="100%" height={50} onClick={goToNext}>
                다음으로
              </Button>
            </section>
          )}

          {step === 3 && signUpType === "ENTERPRISE" && (
            <section>
              <h2 className="text-center text-[24px] font-bold text-gray-900 mb-3">유의사항 확인</h2>
              <p className="text-center text-[14px] text-gray-500 mb-8">
                법인회원 거래 유의사항을 확인해주세요
              </p>

              <div className="bg-gray-50 border border-gray-200 p-5 rounded-[8px] text-[13px] h-[150px] overflow-y-auto mb-6 text-gray-600 leading-6">
                <h4 className="font-bold mb-3">[법인회원 고객확인 거래 유의사항]</h4>
                1. 자금세탁방지 의무 준수
                <br />
                2. 정보 제공의 정확성 보장
                <br />
                3. 실소유주 정보 제공 의무
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cautionAgreed}
                  onChange={(e) => {
                    setCautionAgreed(e.target.checked);
                    setCautionStatus({ msg: "", ok: null });
                  }}
                />
                <span className="font-bold text-gray-900">
                  위 내용을 모두 확인하였으며 동의합니다.
                </span>
              </label>

              {renderStatus(cautionStatus)}

              <Button type="button" variant="check" width="100%" height={50} onClick={goToNext}>
                다음으로
              </Button>
            </section>
          )}

          {step === 4 && (
            <section>
              <h2 className="text-center text-[24px] font-bold text-gray-900 mb-3">본인 확인</h2>
              <p className="text-center text-[14px] text-gray-500 mb-8">
                휴대폰 본인인증을 진행합니다
              </p>

              <div className="mb-3">
                <label className={labelClassName}>휴대폰 번호</label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ""));
                    setPhoneVerified(false);
                    setPhoneStatus({ msg: "", ok: null });
                  }}
                  placeholder="01012345678"
                  height={50}
                />
                {renderStatus(phoneStatus)}
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  className="w-full h-[50px] rounded-[8px] font-semibold border border-green-600 text-green-600"
                  onClick={mockPhoneVerify}
                >
                  본인인증 완료하기 (PASS 연동)
                </button>
                <p className="mt-2 text-[12px] text-gray-500 text-center">
                  * 현재 테스트 모드로 즉시 인증됩니다.
                </p>
              </div>

              <Button type="button" variant="check" width="100%" height={50} onClick={goToNext}>
                다음으로
              </Button>
            </section>
          )}

          {step === 5 && (
            <section>
              <h2 className="text-center text-[24px] font-bold text-gray-900 mb-3">이메일 인증</h2>
              <p className="text-center text-[14px] text-gray-500 mb-8">
                로그인 아이디로 사용할 이메일을 인증하세요
              </p>

              <div className="mb-5">
                <label className={labelClassName}>이메일 주소 (ID)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailVerified(false);
                        setEmailSendStatus({ msg: "", ok: null });
                        setEmailVerifyStatus({ msg: "", ok: null });
                      }}
                      placeholder="example@farm.com"
                      className="pr-20"
                      height={50}
                    />
                    {emailRemainSec > 0 && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-red-500 font-semibold">
                        {formatMMSS(emailRemainSec)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="px-5 h-[50px] bg-gray-900 text-white rounded-[8px] font-semibold whitespace-nowrap"
                    onClick={sendEmailCode}
                    disabled={loading.emailSend}
                  >
                    {loading.emailSend ? "전송 중..." : emailRemainSec > 0 ? "재전송" : "인증요청"}
                  </button>
                </div>
                {renderStatus(emailSendStatus)}
              </div>

              <div className="mb-5">
                <label className={labelClassName}>인증번호</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={emailCode}
                    onChange={(e) => {
                      setEmailCode(e.target.value);
                      setEmailVerifyStatus({ msg: "", ok: null });
                    }}
                    placeholder="인증번호 6자리"
                    height={50}
                  />
                  <button
                    type="button"
                    className="px-5 h-[50px] bg-gray-900 text-white rounded-[8px] font-semibold whitespace-nowrap"
                    onClick={confirmEmailCode}
                    disabled={loading.emailConfirm}
                  >
                    {loading.emailConfirm ? "확인 중..." : "확인"}
                  </button>
                </div>
                {renderStatus(emailVerifyStatus)}
              </div>

              <Button type="button" variant="check" width="100%" height={50} onClick={goToNext}>
                다음으로
              </Button>
            </section>
          )}

          {step === 6 && (
            <section>
              <h2 className="text-center text-[24px] font-bold text-gray-900 mb-3">회원정보 입력</h2>
              <p className="text-center text-[14px] text-gray-500 mb-8">
                가입 정보를 확인하고 비밀번호를 설정하세요
              </p>

              <div className="mb-5">
                <label className={labelClassName}>이름</label>
                <Input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setSignupStatus({ msg: "", ok: null });
                  }}
                  placeholder="이름 입력"
                  height={50}
                />
              </div>

              <div className="mb-5">
                <label className={labelClassName}>이메일 (ID)</label>
                <Input type="text" value={email} readOnly className="!bg-gray-100" height={50} />
              </div>

              {signUpType === "ENTERPRISE" && (
                <div className="mb-5">
                  <label className={labelClassName}>사업자 등록번호</label>
                  <Input type="text" value={bNo} readOnly className="!bg-gray-100" height={50} />
                </div>
              )}

              <div className="mb-5">
                <label className={labelClassName}>비밀번호</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSignupStatus({ msg: "", ok: null });
                  }}
                  placeholder="비밀번호"
                  height={50}
                />
              </div>

              <div className="mb-5">
                <label className={labelClassName}>비밀번호 확인</label>
                <Input
                  type="password"
                  value={password2}
                  onChange={(e) => {
                    setPassword2(e.target.value);
                    setSignupStatus({ msg: "", ok: null });
                  }}
                  placeholder="비밀번호 재입력"
                  height={50}
                />
                {renderStatus(
                  passwordMatched === null
                    ? { msg: "", ok: null }
                    : passwordMatched
                      ? { msg: "비밀번호가 일치합니다.", ok: true }
                      : { msg: "비밀번호가 일치하지 않습니다.", ok: false }
                )}
              </div>

              {renderStatus(signupStatus)}

              <Button
                type="button"
                variant="check"
                width="100%"
                height={50}
                onClick={submitSignUp}
                disabled={loading.signup}
              >
                {loading.signup ? "가입 처리 중..." : "가입 완료하기"}
              </Button>
            </section>
          )}

          {step === 7 && (
            <section className="text-center py-10">
              <div className="text-[64px] mb-6 text-green-600">🌿</div>
              <h2 className="text-center text-[24px] font-bold text-gray-900 mb-3">
                가입을 축하드립니다!
              </h2>
              <p className="text-center text-[14px] text-gray-500 mb-8">
                로그인 페이지로 이동하여 서비스를 이용해보세요.
              </p>
              <button
                type="button"
                className="w-full h-[50px] rounded-[8px] bg-green-600 text-white font-semibold"
                onClick={() => navigate("/auth/login")}
              >
                로그인하러 가기
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}