// src/components/carbon/CarbonCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { CarbonListDTO } from "../../../types/carbonType";

interface CarbonCardProps {
  item: CarbonListDTO;
}

export default function CarbonCard({ item }: CarbonCardProps) {
  const navigate = useNavigate();
  const isRemoval = item.category === "REMOVAL";

  return (
    <div className="bg-white rounded-[var(--radius-l)] overflow-hidden border border-gray-100 shadow-[var(--shadow-std)]">
      {/* 썸네일 & 배지 */}
      <div className="relative h-[170px] bg-gray-100 overflow-hidden">
        <img
          src={item.thumbnailUrl || "/resources/img/carbon_sample.jpg"}
          alt={item.cpTitle}
          className="w-full h-full object-cover block"
        />
        <div
          className={`absolute left-3 top-3 inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-black border border-black/5 backdrop-blur-md bg-white/90 ${
            isRemoval ? "text-[#2E7127]" : "text-[#1F76D2]"
          }`}
        >
          {isRemoval ? "제거형" : "감축형"} · {item.vintageYear}
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="px-[18px] pt-[18px] pb-4">
        <h3 className="text-[18px] font-black leading-tight mt-0.5 mb-3.5 text-gray-900 truncate">
          {item.cpTitle}
        </h3>
        <div className="h-px bg-black/5 my-2.5" />

        {/* 수량 정보 */}
        <div className="flex justify-between items-baseline gap-2.5 text-[13px] text-gray-500 mb-2">
          <span>잔여 수량</span>
          <span className="text-gray-900 font-extrabold">
            {Number(item.cpAmount || 0).toLocaleString()} tCO2e
          </span>
        </div>

        {/* 가격 & 혜택 */}
        <div className="mt-2.5 text-right">
          {item.userBenefit ? (
            <>
              <div className="text-[13px] mb-1">
                <span className="line-through text-gray-400 mr-2">
                  {Number(item.cpPrice).toLocaleString()} P
                </span>
                <span className="text-error font-extrabold">
                  {item.userBenefit.discountRate}% 할인
                </span>
              </div>
              <div className="mt-1.5 text-[26px] font-black text-gray-900">
                {Number(item.userBenefit.currentPrice).toLocaleString()} P
              </div>
            </>
          ) : (
            <div className="mt-1.5 text-[26px] font-black text-gray-900">
              {Number(item.cpPrice).toLocaleString()} P
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="px-[18px] pb-[18px]">
        <button
          onClick={() => navigate(`/carbon/${item.cpId}`)}
          className={`w-full h-[56px] rounded-[var(--radius-m)] border-0 font-black text-white cursor-pointer transition-colors bg-[#1f1f1f] ${
            isRemoval ? "hover:bg-[#4A9F2E]" : "hover:bg-[#1F76D2]"
          }`}
        >
          구매하기
        </button>
      </div>
    </div>
  );
}