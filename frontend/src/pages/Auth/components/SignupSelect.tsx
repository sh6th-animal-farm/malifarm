import AuthCard from "@/components/common/AuthCard";
import { EnterpriseUser, PersonalUser } from "@/components/icon/Icons";

type SignUpType = "PERSONAL" | "ENTERPRISE";

type SignupTypeSelectProps = {
  onSelect: (type: SignUpType) => void;
  onGoLogin: () => void;
};

export default function SignupTypeSelect({
  onSelect,
  onGoLogin,
}: SignupTypeSelectProps) {
  return (
    <main className="flex-1 flex flex-col min-h-[calc(75vh-var(--spacing-header-height))] items-center py-10 pt-20 bg-gray-50">
      <AuthCard
        title="회원가입"
        description="가입하실 회원 유형을 선택해주세요"
      >
        <button
          type="button"
          onClick={() => onSelect("PERSONAL")}
          className="w-full p-6 border border-gray-200 rounded-[12px] flex items-center gap-5 bg-white mb-4 text-left hover:border-green-500 transition-colors"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
            <PersonalUser size={32} color="#000000" />
          </div>
          <div>
            <h4 className="text-[17px] font-bold text-gray-900 mb-1">개인 회원</h4>
            <p className="text-[14px] text-gray-500">일반 투자 및 서비스를 이용하는 개인</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect("ENTERPRISE")}
          className="w-full p-6 border border-gray-200 rounded-[12px] flex items-center gap-5 bg-white text-left hover:border-green-500 transition-colors"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
            <EnterpriseUser size={32} color="#000000" />
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
            onClick={onGoLogin}
            className="text-green-600 font-bold"
          >
            로그인
          </button>
        </div>
      </AuthCard>
    </main>
  );
}