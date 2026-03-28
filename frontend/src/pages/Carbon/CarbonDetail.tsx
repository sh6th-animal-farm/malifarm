// src/pages/Carbon/CarbonDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { carbonApi } from "../../api/carbonApi";
import type { CarbonDetailDTO } from "../../types/carbonType";
import CarbonOrderModal from "./components/CarbonOrderModal";
import CarbonPriceCard from "./components/CarbonPriceCard";

export default function CarbonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [detailData, setDetailData] = useState<CarbonDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await carbonApi.getCarbonDetail(Number(id));
        setDetailData(data);
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
  const locationStr = `위치: ${detailData.addressSido || ""} ${detailData.addressSigungu || ""} ${detailData.addressStreet || ""} ${detailData.addressDetails || ""} ${detailData.farmName || ""} 일대`.trim();

  return (
    // 🌟 화면 전체(w-full)를 덮는 연회색 배경(bg-gray-50) 래퍼 추가!
    <div className="w-full bg-[var(--color-gray-50)] min-h-screen">
      <div className="layout-container py-[48px]">
        <div className="w-full flex gap-[var(--spacing-gutter)] pt-[48px] pb-[48px]">
          
          {/* 왼쪽 메인 콘텐츠 영역 */}
          <main className="flex-1 min-w-0 p-0 m-0">
            
            {/* 상단 이미지 */}
            <div className="w-full h-[420px] rounded-[12px] overflow-hidden mb-[24px] bg-[var(--color-gray-100)]">
              <img
                src={detailData.thumbnailUrl || "/resources/img/carbon_sample.jpg"}
                alt="프로젝트 이미지"
                className="w-full h-full object-cover"
              />
            </div>

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
            {/* 배경색이 전체 페이지 배경과 똑같이 gray-50으로 자연스럽게 녹아듭니다 */}
            <div className="bg-[var(--color-gray-50)] rounded-[var(--radius-l)] mt-[48px] w-full box-border ml-0">
              <h2 className="font-header-02 text-[var(--color-green-600)] border-b-2 border-[var(--color-green-100)] pb-[16px] m-0">
                주요 정보 및 기대 효과
              </h2>
              
              {/* 흰색 카드들이 입체적으로 떠오릅니다! */}
              <div className="grid grid-cols-2 gap-[16px] mt-[24px]">
                <div className="bg-white p-[24px] rounded-[var(--radius-m)] border border-[var(--color-gray-100)]">
                  <label className="block font-caption-02 text-[var(--color-gray-500)] mb-[8px] font-medium">발급 주체</label>
                  <p className="font-subtitle-01 text-[var(--color-gray-900)] font-semibold m-0">마이리틀 스마트팜 협회</p>
                </div>
                <div className="bg-white p-[24px] rounded-[var(--radius-m)] border border-[var(--color-gray-100)]">
                  <label className="block font-caption-02 text-[var(--color-gray-500)] mb-[8px] font-medium">인증기관</label>
                  <p className="font-subtitle-01 text-[var(--color-gray-900)] font-semibold m-0">{carbonInfo.productCertificate}</p>
                </div>
                <div className="bg-white p-[24px] rounded-[var(--radius-m)] border border-[var(--color-gray-100)]">
                  <label className="block font-caption-02 text-[var(--color-gray-500)] mb-[8px] font-medium">상품 유형</label>
                  <p className="font-subtitle-01 text-[var(--color-gray-900)] font-semibold m-0">{carbonInfo.cpType}</p>
                </div>
                <div className="bg-white p-[24px] rounded-[var(--radius-m)] border border-[var(--color-gray-100)]">
                  <label className="block font-caption-02 text-[var(--color-gray-500)] mb-[8px] font-medium">발급 수량</label>
                  <p className="font-subtitle-01 text-[var(--color-gray-900)] font-semibold m-0">
                    {Number(carbonInfo.initAmount || 0).toLocaleString()} tCO2e
                  </p>
                </div>
                <div className="bg-white p-[24px] rounded-[var(--radius-m)] border border-[var(--color-gray-100)]">
                  <label className="block font-caption-02 text-[var(--color-gray-500)] mb-[8px] font-medium">재고 수량</label>
                  <p className="font-subtitle-01 text-[var(--color-gray-900)] font-semibold m-0">
                    {Number(carbonInfo.cpAmount || 0).toLocaleString()} tCO2e
                  </p>
                </div>
                <div className="bg-white p-[24px] rounded-[var(--radius-m)] border border-[var(--color-gray-100)]">
                  <label className="block font-caption-02 text-[var(--color-gray-500)] mb-[8px] font-medium">최소 주문 단위</label>
                  <p className="font-subtitle-01 text-[var(--color-gray-900)] font-semibold m-0">1 tCO2e</p>
                </div>
                <div className="col-span-2 bg-white p-[24px] rounded-[var(--radius-m)] border border-[var(--color-gray-100)]">
                  <label className="block font-caption-02 text-[var(--color-gray-500)] mb-[8px] font-medium">설명</label>
                  <p className="font-subtitle-01 text-[var(--color-gray-900)] font-semibold m-0 leading-[1.6]">
                    {carbonInfo.cpDetail}
                  </p>
                </div>
              </div>
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
  );
}