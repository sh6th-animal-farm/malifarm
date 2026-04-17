import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "@/components/common/AuthCard";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

export type SignUpType = "PERSONAL" | "ENTERPRISE" | null;

export type StatusState = {
  msg: string;
  ok: boolean | null;
};

export type FormState = {
  signUpType: SignUpType;
  step: number;
  agreements: {
    service: boolean;
    privacy: boolean;
    push: boolean;
  };
  bNo: string;
  bNoVerified: boolean;
  cautionAgreed: boolean;
  phone: string;
  phoneVerified: boolean;
  email: string;
  emailCode: string;
  emailVerified: boolean;
  emailExpireAt: number | null;
  userName: string;
};

type SignupPersonalStepProps = {
  form: FormState;
  updateForm: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  goToNext: () => void;
  phoneStatus: StatusState;
  emailSendStatus: StatusState;
  emailVerifyStatus: StatusState;
  signupStatus: StatusState;
  password: string;
  password2: string;
  passwordMatched: boolean | null;
  passwordValidation: {
    isValid: boolean;
    message: string;
  };
  emailRemainSec: number;
  loading: {
    emailConfirm: boolean;
    signup: boolean;
  };
  setPassword: (value: string) => void;
  setPassword2: (value: string) => void;
  setPhoneStatus: (status: StatusState) => void;
  setEmailSendStatus: (status: StatusState) => void;
  setEmailVerifyStatus: (status: StatusState) => void;
  setSignupStatus: (status: StatusState) => void;
  mockPhoneVerify: () => void;
  sendEmailCode: () => void;
  confirmEmailCode: () => void;
  submitSignUp: () => void;
  formatMMSS: (sec: number) => string;
  renderStatus: (status: StatusState) => ReactNode;
};

export default function SignupPersonalStep({
  form,
  updateForm,
  goToNext,
  phoneStatus,
  emailSendStatus,
  emailVerifyStatus,
  signupStatus,
  password,
  password2,
  passwordMatched,
  passwordValidation,
  emailRemainSec,
  loading,
  setPassword,
  setPassword2,
  setPhoneStatus,
  setEmailSendStatus,
  setEmailVerifyStatus,
  setSignupStatus,
  mockPhoneVerify,
  sendEmailCode,
  confirmEmailCode,
  submitSignUp,
  formatMMSS,
  renderStatus,
}: SignupPersonalStepProps) {
  const navigate = useNavigate();

  const labelClassName = "block mb-2 font-caption-03 text-gray-900";

  if (form.step === 4) {
    return (
      <AuthCard title="본인 확인" description="휴대폰 본인인증을 진행합니다">
        <div className="mb-3">
          <label className={labelClassName}>휴대폰 번호</label>
          <Input
            type="text"
            value={form.phone}
            onChange={(e) => {
              updateForm("phone", e.target.value.replace(/\D/g, ""));
              updateForm("phoneVerified", false);
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
      </AuthCard>
    );
  }

  if (form.step === 5) {
    return (
      <AuthCard title="이메일 인증" description="로그인 아이디로 사용할 이메일을 인증하세요">
        <div className="mb-5">
          <label className={labelClassName}>이메일 주소 (ID)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => {
                  updateForm("email", e.target.value);
                  updateForm("emailVerified", false);
                  updateForm("emailExpireAt", null);
                  setEmailSendStatus({ msg: "", ok: null });
                  setEmailVerifyStatus({ msg: "", ok: null });
                }}
                placeholder="example@farm.com"
                className="pr-20"
                height={50}
              />
              {emailRemainSec > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-caption-02 text-error">
                  {formatMMSS(emailRemainSec)}
                </span>
              )}
            </div>
            <button
              type="button"
              className="px-5 h-[50px] bg-gray-900 text-white rounded-[8px] font-semibold whitespace-nowrap"
              onClick={sendEmailCode}
            >
              {emailRemainSec > 0 ? "재전송" : "인증요청"}
            </button>
          </div>
          {renderStatus(emailSendStatus)}
        </div>

        <div className="mb-5">
          <label className={labelClassName}>인증번호</label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={form.emailCode}
              onChange={(e) => {
                updateForm("emailCode", e.target.value);
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
      </AuthCard>
    );
  }

  if (form.step === 6) {
    return (
      <AuthCard title="회원정보 입력" description="가입 정보를 확인하고 비밀번호를 설정하세요">
        <div className="mb-5">
          <label className={labelClassName}>이름</label>
          <Input
            type="text"
            value={form.userName}
            onChange={(e) => {
              updateForm("userName", e.target.value);
              setSignupStatus({ msg: "", ok: null });
            }}
            placeholder="이름 입력"
            height={50}
          />
        </div>

        <div className="mb-5">
          <label className={labelClassName}>이메일 (ID)</label>
          <Input type="text" value={form.email} readOnly className="!bg-gray-100" height={50} />
        </div>

        {form.signUpType === "ENTERPRISE" && (
          <div className="mb-5">
            <label className={labelClassName}>사업자 등록번호</label>
            <Input type="text" value={form.bNo} readOnly className="!bg-gray-100" height={50} />
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
          {renderStatus(
            password.length === 0
              ? { msg: "", ok: null }
              : passwordValidation.isValid
                ? { msg: passwordValidation.message, ok: true }
                : { msg: passwordValidation.message, ok: false }
          )}
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
      </AuthCard>
    );
  }

  if (form.step === 7) {
    return (
      <AuthCard
        title="가입을 축하드립니다!"
        description="로그인 페이지로 이동하여 서비스를 이용해보세요."
      >
        <section className="text-center py-10">
          <div className="text-[64px] mb-6 text-green-600">🌿</div>
          <button
            type="button"
            className="w-full h-[50px] rounded-[8px] bg-green-600 text-white font-semibold"
            onClick={() => navigate("/auth/login")}
          >
            로그인하러 가기
          </button>
        </section>
      </AuthCard>
    );
  }

  return null;
}
