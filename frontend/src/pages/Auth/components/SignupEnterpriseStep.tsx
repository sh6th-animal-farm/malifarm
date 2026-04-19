import AuthCard from '@/components/common/AuthCard';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { LessThan } from '@/components/icon/Icons';
import SignupPersonalStep, {
  type FormState,
  type StatusState,
} from './SignupPersonalStep';

type SignupEnterpriseStepProps = {
  form: FormState;
  updateForm: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  goToNext: () => void;
  bNoStatus: StatusState;
  cautionStatus: StatusState;
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
    enterpriseVerify: boolean;
    emailConfirm: boolean;
    signup: boolean;
  };
  setPassword: (value: string) => void;
  setPassword2: (value: string) => void;
  setCautionStatus: (status: StatusState) => void;
  setPhoneStatus: (status: StatusState) => void;
  setEmailSendStatus: (status: StatusState) => void;
  setEmailVerifyStatus: (status: StatusState) => void;
  setSignupStatus: (status: StatusState) => void;
  onBnoChange: (value: string) => void;
  verifyBno: () => void;
  mockPhoneVerify: () => void;
  sendEmailCode: () => void;
  confirmEmailCode: () => void;
  submitSignUp: () => void;
  formatMMSS: (sec: number) => string;
  renderStatus: (status: StatusState) => React.ReactNode;
};

export default function SignupEnterpriseStep({
  form,
  updateForm,
  goToNext,
  bNoStatus,
  cautionStatus,
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
  setCautionStatus,
  setPhoneStatus,
  setEmailSendStatus,
  setEmailVerifyStatus,
  setSignupStatus,
  onBnoChange,
  verifyBno,
  mockPhoneVerify,
  sendEmailCode,
  confirmEmailCode,
  submitSignUp,
  formatMMSS,
  renderStatus,
}: SignupEnterpriseStepProps) {
  const labelClassName = 'block mb-2 font-caption-03 text-gray-900';

  if (form.step === 2) {
    return (
      <AuthCard
        title="기업 인증"
        description="사업자 등록번호를 확인합니다"
        leftIcon={
          <button
            type="button"
            onClick={() => updateForm('step', 1)}
            className="flex items-center justify-center w-8 h-8"
            aria-label="이전 단계로 이동"
          >
            <LessThan size={18} color="#111827" />
          </button>
        }
      >
        <div className="mb-5">
          <label className={labelClassName}>사업자 등록번호</label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={form.bNo}
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
              {loading.enterpriseVerify ? '조회 중...' : '인증하기'}
            </button>
          </div>
          {renderStatus(bNoStatus)}
        </div>

        <Button
          type="button"
          variant="check"
          width="100%"
          height={50}
          onClick={goToNext}
        >
          다음으로
        </Button>
      </AuthCard>
    );
  }

  if (form.step === 3) {
    return (
      <AuthCard
        title="유의사항 확인"
        description="법인회원 거래 유의사항을 확인해주세요"
        leftIcon={
          <button
            type="button"
            onClick={() => updateForm('step', 2)}
            className="flex items-center justify-center w-8 h-8"
            aria-label="이전 단계로 이동"
          >
            <LessThan size={18} color="#111827" />
          </button>
        }
      >
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-[8px] text-[13px] h-[150px] overflow-y-auto mb-6 text-gray-600 leading-6">
          <h4 className="font-bold mb-3">[법인회원 고객확인 거래 유의사항]</h4>
          1. 자금세탁방지 의무 준수
          <br />
          2. 정보 제공의 정확성 보장
          <br />
          3. 실소유주 정보 제공 의무
        </div>

        <label className="flex items-center gap-2 cursor-pointer font-normal">
          <input
            type="checkbox"
            checked={form.cautionAgreed}
            onChange={(e) => {
              updateForm('cautionAgreed', e.target.checked);
              setCautionStatus({ msg: '', ok: null });
            }}
            className="w-4 h-4 accent-(--color-green-600) shrink-0 cursor-pointer"
          />
          <span className="font-bold text-gray-900">
            위 내용을 모두 확인하였으며 동의합니다.
          </span>
        </label>

        {renderStatus(cautionStatus)}

        <Button
          type="button"
          variant="check"
          width="100%"
          height={50}
          onClick={goToNext}
        >
          다음으로
        </Button>
      </AuthCard>
    );
  }

  return (
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
  );
}
