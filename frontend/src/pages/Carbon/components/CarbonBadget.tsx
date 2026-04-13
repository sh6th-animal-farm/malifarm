interface CarbonBadgeProps {
  // 🌟 DTO에 "ALL"이 포함되어 있어 발생하는 타입 에러를 막기 위해 string으로 넓게 허용합니다.
  type: string;
  vintageYear: string | number;
}

export default function CarbonBadge({ type, vintageYear }: CarbonBadgeProps) {
  const isRemoval = type === 'REMOVAL';

  // 피그마 시안의 Info / InfoLight 컬러 매핑 (제거형은 초록색, 감축형은 파란색)
  const bgColor = isRemoval
    ? 'bg-[var(--color-success-light)]'
    : 'bg-[var(--color-info-light)]';
  const textColor = isRemoval
    ? 'text-[var(--color-success)]'
    : 'text-[var(--color-info)]';
  const label = isRemoval ? '제거형' : '감축형';

  return (
    // 🌟 피그마 시안 완벽 일치: py-[4px] px-[12px] rounded-[var(--radius-s) = 8px]
    <div
      className={`inline-flex items-center px-[12px] py-[4px] rounded-[var(--radius-s)] font-caption-03 ${bgColor} ${textColor}`}
    >
      {label} · {vintageYear}
    </div>
  );
}
