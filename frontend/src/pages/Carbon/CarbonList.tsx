// src/pages/Carbon/CarbonList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { carbonApi } from "../../api/carbonApi";
import type { CarbonListDTO } from "../../types/carbonType";
import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/layout/SectionHeader";
import CarbonCard from "./components/CarbonCard";
import CarbonDiscountRateModal from "./components/CarbonDiscountRateModal";

export default function CarbonList() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<"ALL" | "REMOVAL" | "REDUCTION">("ALL");
  const [carbonList, setCarbonList] = useState<CarbonListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    fetchCarbonList(category);
  }, [category]);

  const fetchCarbonList = async (cat: string) => {
    setIsLoading(true);
    try {
      const data = await carbonApi.getCarbonList(cat);
      setCarbonList(data);
    } catch (error) {
      console.error("탄소 리스트 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 🌟 화면 전체(w-full)를 덮는 연회색 배경(bg-gray-50) 래퍼 추가!
    <div className="w-full min-h-screen">
      <section className="layout-container py-20 md:py-20">
        
        {/* 헤더 상단 정렬 */}
        <div className="flex justify-between items-start mb-[24px] px-5 xl:px-0">
          <div className="relative">
            <SectionHeader
              title="탄소마켓"
              subtitle="보유한 포인트를 사용하여 탄소 배출권을 구매하고 ESG 경영을 실천하세요."
              className="mb-0"
              titleSuffix={
                <div className="relative inline-flex">
                  <button
                    className={`flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full border-none align-middle font-caption-02 text-white transition-all ${
                      isGuideOpen ? "bg-[var(--color-green-600)]" : "bg-[var(--color-gray-300)]"
                    }`}
                    onClick={() => setIsGuideOpen(!isGuideOpen)}
                  >
                    ?
                  </button>

                  <CarbonDiscountRateModal
                    isOpen={isGuideOpen}
                    onClose={() => setIsGuideOpen(false)}
                  />
                </div>
              }
            />
          </div>
          <button
            onClick={() => navigate("/mypage/carbon-history")}
            className="font-button-02 text-[var(--color-green-600)] border border-[var(--color-green-600)] px-[20px] py-[10px] rounded-[var(--radius-s)] bg-white whitespace-nowrap mt-[5px] transition-all duration-200 hover:bg-[var(--color-green-50)] cursor-pointer no-underline"
          >
            구매한 탄소 상품 보러가기 &gt;
          </button>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-[10px] flex-wrap mt-[24px] px-5 xl:px-0">
          {(["ALL", "REMOVAL", "REDUCTION"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-[12px] py-[8px] rounded-[var(--radius-m)] font-button-02 transition-all duration-200 border-none cursor-pointer ${
                category === cat
                  ? "bg-[var(--color-green-600)] text-white"
                  : "bg-transparent text-[var(--color-gray-500)] hover:bg-[var(--color-green-0)] hover:text-[var(--color-green-600)]"
              }`}
            >
              {cat === "ALL" ? "전체보기" : cat === "REMOVAL" ? "제거형 (Removal)" : "감축형 (Reduction)"}
            </button>
          ))}
        </div>

        {/* 그리드 */}
        <div className="mt-[18px] min-h-[400px] px-5 xl:px-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-[var(--color-gray-400)]">로딩 중...</div>
          ) : carbonList.length === 0 ? (
            <EmptyState
              message="구매 가능한 상품이 없습니다."
              className="mb-0 px-5 py-10"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[26px]">
              {carbonList.map((item) => (
                <CarbonCard key={item.cpId} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
