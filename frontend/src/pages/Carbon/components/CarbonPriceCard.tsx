// src/pages/Carbon/components/CarbonPriceCard.tsx

interface CarbonPriceCardProps {
  originalPrice: number;
  discountRate: number;
  currentPrice: number;
  onOrderClick: () => void;
}

export default function CarbonPriceCard({
  originalPrice,
  discountRate,
  currentPrice,
  onOrderClick,
}: CarbonPriceCardProps) {
  // 할인 여부 체크
  const hasDiscount = discountRate > 0;
  // 실제 표시할 최종 가격
  const finalPrice = hasDiscount ? currentPrice : originalPrice;

  return (
    // 🌟 1. 카드 전체 배경, 그림자, 패딩 (피그마 시안 기준 넉넉한 안쪽 여백 32px 적용)
    <div className="w-[416px] h-[261px] bg-white rounded-(--radius-lg) shadow-(--shadow-std) p-[24px] box-border flex flex-col justify-between">
      {/* 🌟 2. 텍스트 그룹 (내부 요소 갭 13px 고정) */}
      <div className="flex flex-col gap-[13px]">
        {/* 🌟 2. 상단 타이틀 */}
        <div className="font-caption-01 text-(--color-gray-600)">
        현재 단가 (1 tCO2e)
      </p>

      {/* 2. 취소선 가격 & 할인율 */}
      <div className="flex items-center gap-[8px] mb-[12px]">
        <span className="text-[var(--color-gray-400)] font-caption-01 line-through">
          {(originalPrice || 0).toLocaleString()} KRW
        </span>
        <span className="text-[var(--color-error)] font-caption-03 !font-bold">
          {discountRate || 0}% 할인
        </span>
      </div>

      {/* 3. 최종 가격 (크기 32px 강제 고정) */}
      <strong className="font-header-01 text-[var(--color-gray-900)] block mb-[8px] !text-[32px] leading-tight m-0">
        {(currentPrice || 0).toLocaleString()}원
      </strong>

      {/* 4. 부가세 안내 문구 (아래 여백 32px) */}
      <p className="text-[var(--color-gray-400)] font-caption-01 mb-[32px] m-0">
        * 부가세(VAT) 별도 금액
      </p>

      {/* 5. 주문 버튼 (🌟 뚱뚱했던 패딩을 지우고 h-[56px]로 규격 완벽 고정!) */}
      <button
        onClick={onOrderClick}
        className="w-full h-[56px] flex items-center justify-center bg-[var(--color-green-600)] text-white font-button-01 !font-bold rounded-[var(--radius-s)] border-none cursor-pointer transition-colors duration-200 hover:bg-[var(--color-green-700)] p-0 m-0"
      >
        주문 신청하기
      </button>

    </div>
  );
}