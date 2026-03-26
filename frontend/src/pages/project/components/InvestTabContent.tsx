import type { ProjectData } from '@/types/project';
import InfoGrid from './DetailInfoCard';

export default function InvestTabContent({ data }: { data: ProjectData }) {
  // 데이터를 화면에 뿌리기 좋게 매핑
  const investInfoItems = [
    { label: "예상 수익률", value: `${data.expectedReturn}%` },
    { label: "청약 달성률", value: `${data.subscriptionRate}%` },
    { label: "총 모집 금액", value: `${data.actualAmount?.toLocaleString()}원` },
    { label: "목표 금액", value: `${data.targetAmount?.toLocaleString()}원` },
    { label: "인당 투자 최소 금액", value: `${data.minAmountPerInvestor?.toLocaleString()}원` },
    { label: "진행 상태", value: data.projectStatus },
  ];

  return (
    <div className="w-full">
      <InfoGrid items={investInfoItems} />
    </div>
  );
}