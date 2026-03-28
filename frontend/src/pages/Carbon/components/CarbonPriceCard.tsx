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
  return (
    <div className="w-[416px] min-h-[261px] p-[32px] bg-white border border-[var(--color-gray-0)] rounded-[var(--radius-m)] shadow-[var(--shadow-std)] box-border flex flex-col">
      
      {/* 1. 현재 단가 텍스트 */}
      <p className="text-[var(--color-gray-500)] font-caption-02 mb-[8px] m-0">
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