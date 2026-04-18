// src/pages/Carbon/CarbonDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { carbonApi } from "../../api/carbonApi";
import type { CarbonDetailDTO } from "../../types/carbonType";
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

  if (isLoading) return <div className="flex justify-center items-center min-h-[500px] text-[var(--color-gray-400)]">데이터를 불러오는 중입니다...</div>;
  
  if (!detailData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-[64px] h-[64px] bg-[var(--color-gray-100)] text-[var(--color-gray-400)] rounded-full flex items-center justify-center text-[32px] font-bold">!</div>
        <p className="text-[18px] text-[var(--color-gray-400)] font-medium">상품 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate("/carbon/list")} className="px-6 py-2 bg-[var(--color-green-600)] text-white rounded-md hover:bg-[var(--color-green-700)] transition-colors">목록으로 돌아가기</button>
      </div>
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
    { text: "주요 정보 및 기대 효과", value: "info" }
    // 필요 시 여기에 다른 탭("프로젝트 진행 상황" 등)을 추가할 수 있습니다.
  ];


  return (
    <PageShell>
      {/* 🌟 화면 전체(w-full)를 덮는 연회색 배경(bg-gray-50) 래퍼 추가! */}
      <div className="w-full bg-[var(--color-gray-50)] min-h-screen">
        <div className="layout-container py-[48px]">
        <div className="w-full flex gap-[var(--spacing-gutter)] pt-[48px] pb-[48px]">
          
          {/* 왼쪽 메인 콘텐츠 영역 */}
          <main className="flex-1 min-w-0 p-0 m-0">
            
            {/* 상단 이미지 */}
            <ImageCarousel images={imageList} />

            {/* 프로젝트 헤더 */}
            <div className="mt-[48px] p-0 ml-0">
              <div className="text-[var(--color-green-600)] font-caption-03 font-bold mb-[8px]">
                {carbonInfo.cpType} 프로젝트 | {carbonInfo.vintageYear} 빈티지
              </div>
              <h1 className="font-header-01 text-[var(--color-gray-900)] font-bold mb-[12px]">
                {carbonInfo.cpTitle}
              </h1>
              <p className="font-subtitle-02 text-[var(--color-gray-500)] m-0">{locationStr}</p>
            </div>

            {/* 상세 정보 섹션 */}
            {/* 🌟 탭 및 하단 상세 정보 영역 */}
            <div className="mt-[64px] w-full box-border ml-0">
              
              {/* 기존 h2 태그 대신 TabMenu 컴포넌트 삽입! */}
              <TabMenu 
                items={tabItems}
                currentValue={currentTab}
                onTabChange={setCurrentTab}
              />
              
              {/* 탭이 'info'일 때만 InfoGrid 렌더링 */}
              {currentTab === "info" && (
                <div className="mt-[32px]">
                  <InfoGrid items={infoItems} />
                </div>
              )}
              
            </div>

            {/* 프로젝트 보러가기 버튼 */}
            <button
              type="button"
              onClick={() => navigate(`/project/${carbonInfo.projectId}`)}
              className="flex justify-center items-center w-full max-w-[480px] mx-auto mt-[48px] p-[16px] border border-[var(--color-green-600)] bg-white text-[var(--color-green-600)] rounded-[var(--radius-s)] font-button-01 font-semibold cursor-pointer hover:bg-[var(--color-green-50)] transition-colors"
            >
              프로젝트 보러가기
            </button>
          </main>

          {/* 오른쪽 사이드바 (가격 카드) - 흰색 카드가 회색 배경 위로 예쁘게 뜹니다! */}
          <aside className="w-[416px] shrink-0">
            <div className="sticky top-[100px]">
              <CarbonPriceCard 
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
