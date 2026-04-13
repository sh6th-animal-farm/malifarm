// src/pages/Carbon/components/CarbonCard.tsx
import { useNavigate } from "react-router-dom";
import type { CarbonListDTO } from "@/types/carbonType";
import CarbonBadge from "./CarbonBadget";

interface CarbonCardProps {
  item: CarbonListDTO;
}

export default function CarbonCard({ item }: CarbonCardProps) {
  const navigate = useNavigate();
  const isRemoval = item.category === "REMOVAL";
  const discountRate = Number(item.userBenefit?.discountRate ?? 0);
  const hasDiscount = discountRate > 0;
  const currentPrice = Number(item.userBenefit?.currentPrice ?? item.cpPrice ?? 0);
  const originalPrice = Number(item.cpPrice ?? 0);

  return (
    // 🌟 카드 전체 크기 및 비율: flex와 h-full을 주어 그리드 내에서 높이가 꽉 차고 일정하게 맞도록 설정
    <article className="font-main tracking-std bg-white rounded-(--radius-lg) overflow-hidden border border-(--color-gray-100) shadow-(--shadow-std) box-border flex flex-col h-full">
      {/* 1. 상단 이미지 영역 */}
      {/* 🌟 썸네일 높이를 피그마 비율에 맞게 220px로 시원하게 키웠습니다. */}
      <div className="relative h-55 bg-(--color-gray-100) overflow-hidden shrink-0">
        <img
          src={item.thumbnailUrl || "/resources/img/carbon_sample.jpg"}
          alt={item.cpTitle}
          className="w-full h-full object-cover block"
        />
        
        {/* 🌟 뱃지 위치: 피그마 시안처럼 안쪽 여백과 동일한 라인에 맞추기 위해 16px로 조정 */}
        <div className="absolute left-4 top-4">
          <CarbonBadge 
            type={item.category} 
            vintageYear={item.vintageYear} 
          />
        </div>
      </div>

      {/* 2. 본문 및 가격 영역 통합 박스 */}
      {/* 🌟 상하좌우 24px 패딩 완벽 적용 */}
      <div className="p-[24px] flex-1 flex flex-col">
        
        {/* 🌟 진짜 데이터 연동: 탄소배출권 이름 (subtitle01) */}
        <div className="font-subtitle-01 leading-[1.3] text-(--color-gray-900) line-clamp-2">
          {item.cpTitle}
        </div>

        {/* 구분선 (이름과 24px 띄움) */}
        <div className="h-px bg-(--color-gray-100) mt-[24px] mb-4" />

        {/* 🌟 진짜 데이터 연동: 수량 정보 */}
        <div className="flex justify-between items-baseline gap-2.5">
          <span className="font-caption-01 text-(--color-gray-500)">구매 가능 수량</span>
          <span className="text-(--color-gray-900) font-caption-03">
            {item.cpAmount ? Number(item.cpAmount).toLocaleString() : "-"} tCO2e
          </span>
        </div>

        {/* 🌟 진짜 데이터 연동: 가격 & 할인 정보 (flex-1로 하단으로 쫙 밀어냄) */}
        <div className="mt-4 text-right flex-1 flex flex-col justify-end">
          <div className="min-h-4.75 mb-1.25">
            {hasDiscount && (
              <>
                <span className="font-caption-01 text-(--color-gray-400) line-through mr-2">
                  {originalPrice.toLocaleString()} P
                </span>
                <span className="font-caption-02 text-error">
                  {discountRate}% 할인
                </span>
              </>
            )}
          </div>
          <div className="font-header-02 text-(--color-gray-900)">
            {(hasDiscount ? currentPrice : originalPrice).toLocaleString()} P
          </div>
        </div>

        {/* 3. 하단 액션 버튼 */}
        {/* 버튼 위쪽 마진 24px 완벽 적용 */}
        <button
          onClick={() => navigate(`/carbon/${item.cpId}`)}
          className={`font-button-01 mt-[24px] w-full h-14 rounded-m border-0 text-white cursor-pointer bg-(--color-gray-900) transition-colors duration-300 shrink-0 ${
            isRemoval ? "hover:bg-(--color-green-600)" : "hover:bg-(--color-info)"
          }`}
        >
          상세 보기 및 주문
        </button>
      </div>

    </article>
  );
}
