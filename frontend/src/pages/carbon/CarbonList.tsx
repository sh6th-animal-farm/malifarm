import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { carbonApi } from "../../api/carbonApi";
import type { CarbonListDTO } from "../../types/carbonType";
import EmptyState from "@/components/common/EmptyState";
import FilterGroup from "@/components/common/FilterGroup";
import Button from "@/components/common/Button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import SectionHeader from "@/components/layout/SectionHeader";
import PageShell from "@/components/layout/PageShell";
import CarbonCard from "./components/CarbonCard";
import CarbonDiscountRateModal from "./components/CarbonDiscountRateModal";

export default function CarbonList() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [category, setCategory] = useState<"ALL" | "REMOVAL" | "REDUCTION">("ALL");
  const [carbonList, setCarbonList] = useState<CarbonListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    fetchCarbonList(category);
  }, [category]);

  const fetchCarbonList = async (cat: string) => {
    setIsLoading(true);
    try {
      const data = await carbonApi.getCarbonList(cat);
      setCarbonList(data);
      setIsForbidden(false);
    } catch (error) {
      console.error("탄소 리스트 로딩 실패:", error);

      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setIsForbidden(true);
        setCarbonList([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="lg:bg-white">
        <section className="layout-container pb-4 lg:py-20">
            <div className="flex justify-between">
              <div className="relative">
                <SectionHeader
                  title="탄소마켓"
                  subtitle="보유한 토큰에서 나온 탄소 배출권을 구매하고 ESG 경영을 실천하세요."
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

              {!isForbidden && !isMobile && (
                <Button
                  onClick={() => navigate("/mypage/carbon-history")}
                  variant="outline-default"
                  width="auto"
                  height={44}
                  className="whitespace-nowrap px-[20px] py-[10px]"
                >
                  구매한 탄소 상품 보러가기 &gt;
                </Button>
              )}
            </div>

          {!isForbidden && (
            <div className="py-3">
              <FilterGroup
                items={[
                  { text: "전체보기", value: "ALL" },
                  { text: "제거형", value: "REMOVAL" },
                  { text: "감축형", value: "REDUCTION" },
                ]}
                currentValue={category}
                onFilterChange={(value) =>
                  setCategory(value as "ALL" | "REMOVAL" | "REDUCTION")
                }
              />
            </div>
          )}

          <div>
            {isLoading ? (
              <div className="flex h-[320px] items-center justify-center text-gray-400">
                <span className="font-body-01">로딩 중...</span>
              </div>
            ) : isForbidden ? (
              <EmptyState
                message="현재 탄소마켓은 준비 중입니다."
                className="mb-0 py-10"
              />
            ) : carbonList.length === 0 ? (
              <EmptyState
                message="구매 가능한 상품이 없습니다."
                className="mb-0 py-10"
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-[26px]">
                {carbonList.map((item) => (
                  <CarbonCard key={item.cpId} item={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
