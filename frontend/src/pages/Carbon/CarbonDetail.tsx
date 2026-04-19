// src/pages/Carbon/CarbonDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { carbonApi } from "../../api/carbonApi";
import type { CarbonDetailDTO } from "../../types/carbonType";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import CarbonOrderModal from "./components/CarbonOrderModal";
import CarbonPriceCard from "./components/CarbonPriceCard";
import InfoGrid from "../project/components/DetailInfoCard";
import ImageCarousel from "../project/components/ImageCarousel";
import TabMenu from "@/components/common/TabMenu";
import PageShell from "@/components/layout/PageShell";


export default function CarbonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [detailData, setDetailData] = useState<CarbonDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("info");

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await carbonApi.getCarbonDetail(Number(id));
        setDetailData(data);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "mobile-carbon-detail-title",
            data.carbonInfo?.cpTitle || "탄소마켓",
          );
        }
      } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="layout-container py-8 md:py-20">
          <div className="flex min-h-[500px] items-center justify-center text-gray-400">
            데이터를 불러오는 중입니다...
          </div>
        </div>
      </PageShell>
    );
  }
  
  if (!detailData) {
    return (
      <PageShell>
        <div className="layout-container py-8 md:py-20">
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-4">
            <EmptyState
              message="상품 정보를 찾을 수 없습니다."
              className="mb-0 py-0"
            />
            <Button
              variant="default"
              width={180}
              height={48}
              onClick={() => navigate("/carbon/list")}
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  const { carbonInfo, userBenefit } = detailData;

  // 썸네일 주소를 대괄호[]로 감싸서 '무조건 1개짜리 배열'로 만듭니다.
  const imageList = [detailData.thumbnailUrl || "/resources/img/carbon_sample.jpg"];


  const locationStr = `위치: ${detailData.addressSido || ""} ${detailData.addressSigungu || ""} ${detailData.addressStreet || ""} ${detailData.addressDetails || ""} ${detailData.farmName || ""} 일대`.trim();
  
  const infoItems = [
    { label: "발급 주체", value: "마이리틀 스마트팜 협회" },
    { label: "인증기관", value: carbonInfo.productCertificate },
    { label: "상품 유형", value: carbonInfo.cpType },
    { label: "발급 수량", value: `${Number(carbonInfo.initAmount || 0).toLocaleString()} tCO2e` },
    { label: "재고 수량", value: `${Number(carbonInfo.cpAmount || 0).toLocaleString()} tCO2e` },
    { label: "최소 주문 단위", value: "1 tCO2e" },
    // 설명 부분은 가로로 꽉 차야 하므로 fullWidth: true 속성을 줍니다.
    { label: "설명", value: carbonInfo.cpDetail, fullWidth: true },
  ];

  // 🌟 TabMenu용 데이터
  const tabItems = [
    { text: "주요 정보", value: "info" }
    // 필요 시 여기에 다른 탭("프로젝트 진행 상황" 등)을 추가할 수 있습니다.
  ];


  return (
    <PageShell>
      <div className="min-h-full w-full bg-[var(--color-gray-50)] md:min-h-screen">
        <div className="layout-container pb-4 md:py-12">
        <div className="w-full flex flex-col gap-4 pb-4 md:flex-row md:gap-[var(--spacing-gutter)] md:py-12">
          
          <main className="flex-1 min-w-0 p-0 m-0">
            
            <div className="-mx-4 md:mx-0">
              <ImageCarousel images={imageList} />
            </div>

            <div className="mt-4 md:hidden">
              <CarbonPriceCard 
                projectCategory={carbonInfo.cpType}
                vintageYear={carbonInfo.vintageYear}
                projectName={carbonInfo.cpTitle}
                originalPrice={carbonInfo.cpPrice}
                discountRate={userBenefit?.discountRate || 0}
                currentPrice={userBenefit?.currentPrice || 0}
                onOrderClick={() => setIsOrderModalOpen(true)}
              />
            </div>

            <div className="w-full">
              <TabMenu 
                items={tabItems}
                currentValue={currentTab}
                onTabChange={setCurrentTab}
                marginY={16}
              />
              
              {currentTab === "info" && (
                <div>
                  <InfoGrid items={infoItems} />
                </div>
              )}
              
            </div>

            <Button
              type="button"
              variant="outline-default"
              width="100%"
              height={56}
              onClick={() => navigate(`/project/${carbonInfo.projectId}`)}
              className="mx-auto mt-6 flex max-w-[480px] md:mt-12"
            >
              프로젝트 보러가기
            </Button>
          </main>

          <aside className="hidden w-[416px] shrink-0 md:block">
            <div className="sticky top-[100px]">
              <CarbonPriceCard 
                projectCategory={carbonInfo.cpType}
                vintageYear={carbonInfo.vintageYear}
                projectName={carbonInfo.cpTitle}
                originalPrice={carbonInfo.cpPrice}
                discountRate={userBenefit?.discountRate || 0}
                currentPrice={userBenefit?.currentPrice || 0}
                onOrderClick={() => setIsOrderModalOpen(true)}
              />
            </div>
          </aside>

        </div>

          <CarbonOrderModal 
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          cpId={Number(id)}
          productName={carbonInfo.cpTitle}
          unitPrice={userBenefit?.currentPrice || carbonInfo.cpPrice || 0}
          maxQty={carbonInfo.cpAmount || 0}
        />
        </div>
      </div>
    </PageShell>
  );
}
