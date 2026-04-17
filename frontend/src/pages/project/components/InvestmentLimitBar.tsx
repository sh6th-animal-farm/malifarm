interface LimitProps {
  usagePercent: number; // 진행률 (0~100)
  label: string; // 왼쪽 상단 라벨 (예: "나의 연간 투자 한도 잔여")
  usageText: string; // 오른쪽 상단 진행 표시 (예: "30% 사용" 또는 "모집중")
  amountText: string; // 우측 하단 금액/수치 표시 (예: "50,000,000원")
}

export const InvestmentLimitBar = ({
  usagePercent,
  label,
  usageText,
  amountText,
}: LimitProps) => {
  // 0~100 사이 값 유지
  const safePercent = Math.min(Math.max(usagePercent, 0), 100);

  return (
    <div className="mb-5">
      {/* 상단 텍스트 영역 */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span className="font-caption-01">{label}</span>
        <span className="font-caption-01">{usageText}</span>
      </div>

      {/* 프로그레스 바 영역 */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-600 transition-all duration-300"
          style={{ width: `${safePercent}%` }}
        />
      </div>

      {/* 하단 수치 영역 */}
      <div className="text-right mt-2 text-xs font-caption-02 text-gray-700">
        {amountText}
      </div>
    </div>
  );
};
