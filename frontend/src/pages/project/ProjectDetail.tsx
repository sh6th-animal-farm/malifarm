import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { projectApi } from '@/api/projectApi';
import type { ProjectData } from '@/types/project';
import InfoGrid from '@/components/common/InfoGrid';
import ProjectDetailSideBar from '@/components/common/ProjectDetailSideBar';

Chart.register(...registerables);

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'invest' | 'farm'>('invest');
  const [currentIdx, setCurrentIdx] = useState(0);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchDetail = async (projectId: string) => {
      try {
        setLoading(true);
        const response = await projectApi.getProjectDetail(projectId);
        const actualData = (response).data || response;
        setProjectData(actualData);
        
      } catch (error) {
        console.error("API 호출 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail(id);
  }, [id]);

  const moveSlide = (step: number) => {
    if (!projectData?.images || projectData.images.length === 0) return;
    const total = projectData.images.length;
    setCurrentIdx((prev) => (prev + step + total) % total);
  };

  useEffect(() => {
    if (activeTab === 'farm' && chartRef.current && projectData?.temperatureInside) {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: projectData.temperatureInside.map((_, i) => `${i + 9}시`),
            datasets: [{
              label: '내부 기온 (℃)',
              data: projectData.temperatureInside,
              backgroundColor: '#6CC32D',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: false, min: 15, max: 30 } }
          }
        });
      }
    }
    return () => chartInstance.current?.destroy();
  }, [activeTab, projectData]);

  if (loading) return <div className="flex min-h-screen items-center justify-center font-bold text-gray-400">데이터 로딩 중...</div>;
  if (!projectData) return <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">정보를 찾을 수 없습니다.</div>;

  return (
    /* [수정] bg-gray-50 적용 및 전체 높이 확보 */
    <div className="min-h-screen font-main antialiased">
      
      {/* [수정] 이미지 Box Model 수치 적용: 너비 1200px, 상단 40px, 하단 80px 마진 */}
      <div className="max-w-[1200px] mx-auto mt-[40px] mb-[80px]">
        
        {/* [수정] 그리드 시스템 적용: gap-x(컬럼간격) 24px, gap-y(행간격) 24px */}
        <div className="grid grid-cols-12 gap-x-[24px] gap-y-[24px]">
          
          <main className="col-span-12 lg:col-span-8 px-0">
            {/* 캐러셀 섹션 */}
            <div className="relative mb-10 overflow-hidden">
              <div className="rounded-[24px] overflow-hidden h-[420px] bg-gray-100 relative shadow-std border border-gray-100">
                <div 
                  className="flex h-full transition-transform duration-500 ease-in-out" 
                  style={{ transform: `translateX(-${currentIdx * 100}%)` }}
                >
                  {projectData.images?.map((img, i) => (
                    <div key={i} className="min-w-full h-full flex items-center justify-center">
                      <img src={img} className="w-full h-full object-contain" alt="project" />
                    </div>
                  ))}
                </div>
              </div>
              {/* 슬라이드 컨트롤 */}
              <div className="flex items-center justify-center gap-[12px] mt-[24px]">
                <button onClick={() => moveSlide(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all shadow-sm">❮</button>
                <div className="flex gap-2">
                  {projectData.images?.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentIdx(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${currentIdx === i ? 'w-6 bg-green-600' : 'w-2 bg-gray-200'}`} 
                    />
                  ))}
                </div>
                <button onClick={() => moveSlide(1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all shadow-sm">❯</button>
              </div>
            </div>

            {/* 탭 버튼 섹션 */}
            <div className="flex gap-[32px] border-b-2 border-gray-100 mb-8 text-xl font-bold">
              <button 
                onClick={() => setActiveTab('invest')} 
                className={`pb-4 transition-all relative ${activeTab === 'invest' ? 'text-green-600' : 'text-gray-300'}`}
              >
                투자 정보
                {activeTab === 'invest' && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-green-600 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('farm')} 
                className={`pb-4 transition-all relative ${activeTab === 'farm' ? 'text-green-600' : 'text-gray-300'}`}
              >
                농장 정보
                {activeTab === 'farm' && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-green-600 rounded-full" />}
              </button>
            </div>

            {/* 탭 콘텐츠 영역 */}
            <div className="w-full">
              {activeTab === 'invest' ? (
                  <InfoGrid items={[
                    { label: "예상 수익률", value: `${projectData.expectedReturn}%`},
                    { label: "청약 달성률", value: `${projectData.subscriptionRate}%` },
                    { label: "총 모집 금액", value: `${projectData.actualAmount?.toLocaleString()}원` },
                    { label: "목표 금액", value: `${projectData.targetAmount?.toLocaleString()}원` },
                    { label: "인당 투자 최소 금액", value: `${projectData.minAmountPerInvestor?.toLocaleString()}원` },
                    { label: "진행 상태", value: projectData.projectStatus },
                  ]} />
              ) : (
                <div className="space-y-[24px]">
                  <InfoGrid items={[
                    { label: "농장 위치", value: projectData.farm?.addressSido || "정보 없음" },
                    { label: "운영 인원", value: `${projectData.managerCount}명` },
                    { label: "농장 면적", value: `${projectData.farm?.area?.toLocaleString()}㎡` },
                    { label: "재배 방법", value: projectData.method },
                    { label: "운영 계획", value: projectData.projectDescription, fullWidth: true}
                  ]} />
                  {/* 차트 박스 디자인 */}
                  <div className="p-8 bg-white border border-gray-100 rounded-[var(--radius-m)] shadow-std">
                    <p className="font-header-04 text-gray-800 mb-6 font-bold">농장 실시간 기온 추이</p>
                    <div className="h-[300px] w-full"><canvas ref={chartRef}></canvas></div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* 사이드바 */}
          <ProjectDetailSideBar
            projectData={projectData} 
            isApplied={false} 
            onAction={() => {}} 
          />
        </div>
      </div>
    </div>
  );
}