import type { ProjectData } from '@/types/project';
import InfoGrid from './DetailInfoCard';

export default function InvestTabContent({ data }: { data: ProjectData }) {
  const statusMap: Record<string, { label: string }> = {
    PREPARING: { label: '준비중' },
    ANNOUNCEMENT: { label: '공고중' },
    SUBSCRIPTION: { label: '청약중' },
    INPROGRESS: { label: '진행중' },
    CANCELED: { label: '취소' },
    COMPLETED: { label: '완료' },
  };

  // 데이터를 화면에 뿌리기 좋게 매핑
  const investInfoItems = [
    { label: '예상 수익률', value: `${data.expectedReturn}%` },
    { label: '청약 달성률', value: `${data.subscriptionRate}%` },
    {
      label: '현재 달성 금액',
      value: `${data.actualAmount?.toLocaleString()}원`,
    },
    {
      label: '총 모집 금액',
      value: `${data.targetAmount?.toLocaleString()}원`,
    },
    {
      label: '인당 투자 최소 금액',
      value: `${data.minAmountPerInvestor?.toLocaleString()}원`,
    },
    {
      label: '진행 상태',
      value: (
        <span className="font-bold text-green-700">
          {statusMap[data.projectStatus]?.label || data.projectStatus}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <InfoGrid items={investInfoItems} />
    </div>
  );
}
