import AuthCard from "@/components/common/AuthCard";
import Button from "@/components/common/Button";

type Agreements = {
  service: boolean;
  privacy: boolean;
  push: boolean;
};

type SignupTermsStepProps = {
  agreements: Agreements;
  allChecked: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (key: keyof Agreements, checked: boolean) => void;
  onNext: () => void;
};

export default function SignupTermsStep({
  agreements,
  allChecked,
  onToggleAll,
  onToggleOne,
  onNext,
}: SignupTermsStepProps) {
  return (
    <AuthCard
      title="약관 동의"
      description="원활한 서비스 이용을 위해 약관에 동의해주세요"
    >
      <div className="border border-gray-200 rounded-[8px] p-5">
        <label className="flex items-center gap-2 pb-4 border-b border-gray-200 mb-4 cursor-pointer font-normal">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => onToggleAll(e.target.checked)}
            className="w-4 h-4 accent-(--color-green-600) shrink-0 cursor-pointer"
          />
          <span className="font-bold text-gray-900">약관 전체 동의</span>
        </label>

        <label className="flex items-center gap-2 mt-4 cursor-pointer font-normal">
          <input
            type="checkbox"
            checked={agreements.service}
            onChange={(e) => onToggleOne("service", e.target.checked)}
            className="w-4 h-4 accent-(--color-green-600) shrink-0 cursor-pointer"
          />
          <span className="text-gray-900">[필수] 서비스 이용약관 동의</span>
        </label>

        <label className="flex items-center gap-2 mt-4 cursor-pointer font-normal">
          <input
            type="checkbox"
            checked={agreements.privacy}
            onChange={(e) => onToggleOne("privacy", e.target.checked)}
            className="w-4 h-4 accent-(--color-green-600) shrink-0 cursor-pointer"
          />
          <span className="text-gray-900">[필수] 개인정보 수집 및 이용 동의</span>
        </label>

        <label className="flex items-center gap-2 mt-4 cursor-pointer font-normal">
          <input
            type="checkbox"
            checked={agreements.push}
            onChange={(e) => onToggleOne("push", e.target.checked)}
            className="w-4 h-4 accent-(--color-green-600) shrink-0 cursor-pointer"
          />
          <span className="text-gray-900">[선택] 푸시 알람 수신 동의</span>
        </label>
      </div>

      <div className="pb-10" />

      <Button type="button" variant="check" width="100%" height={50} onClick={onNext}>
        다음으로
      </Button>
    </AuthCard>
  );
}