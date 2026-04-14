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
        </div>

        {/* 🌟 3. 할인 정보 영역 (할인이 있을 때만 표시) */}
        <div className="min-h-[25px] flex items-center gap-[8px]">
          {hasDiscount && (
            <>
              <span className="font-caption-01 text-(--color-gray-400) line-through">
                {originalPrice.toLocaleString()} KRW
              </span>
              <span className="font-caption-02 text-error">
                {discountRate}% 할인
              </span>
            </>
          )}
        </div>

        {/* 🌟 4. 최종 가격 영역 (가장 큰 폰트 header-02 적용) */}
        <div className="font-header-02 text-(--color-gray-900)">
          {finalPrice.toLocaleString()}원
        </div>

        {/* 🌟 5. 부가세 안내 문구 */}
        <div className="font-caption-01 text-(--color-gray-500)">
          * 부가세(VAT) 별도 금액
        </div>
      </div>
      {/* 🌟 6. 주문 버튼 (피그마 시안의 버튼 색상과 높이 56px 적용) */}
      <button
        onClick={onOrderClick}
        className="w-full h-[56px] bg-(--color-green-600) hover:bg-(--color-green-700) text-white font-button-01 rounded-(--radius-m) border-0 cursor-pointer transition-colors duration-200 shrink-0"
      >
        주문 신청하기
      </button>
    </div>
  );
}
