import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import type { ProjectData } from '@/types/project';

// 분리한 컴포넌트들 import
import TabMenu from '@/components/common/TabMenu';
import ImageCarousel from './components/ImageCarousel';
import FarmTabContent from './components/FarmTabContent';
import ProjectDetailSideBar from './components/ProjectDetailSideBar';
import InvestTabContent from './components/InvestTabContent';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invest');

  useEffect(() => {
    const fetchDetail = async (projectId: string) => {
      try {
        setLoading(true);
        const response = await projectApi.getProjectDetail(projectId);
        setProjectData(response.data || response);
      } catch (error) {
        console.error("에러:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail(id);
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center font-bold text-gray-400">로딩 중...</div>;
  if (!projectData) return <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">정보 없음</div>;

  return (
    console.log("렌더링 - ProjectDetail"),
    <div className="min-h-screen font-main antialiased bg-white">
      <div className="max-w-[1200px] mx-auto mt-[40px] mb-[80px]">
        <div className="grid grid-cols-12 gap-[24px]">
          <main className="col-span-12 lg:col-span-8">
            
            {/* 1. 이미지 캐러셀 분리 */}
            <ImageCarousel images={projectData.images} />

            {/* 2. 공통 탭 메뉴 컴포넌트 사용 */}
            <TabMenu 
              items={[
                { text: "투자 정보", value: "invest" },
                { text: "농장 정보", value: "farm" }
              ]}
              currentValue={activeTab}
              onTabChange={setActiveTab}
            />

            {/* 3. 탭 콘텐츠 분리 */}
            <div className="w-full">
              {activeTab === 'invest' ? (
                <InvestTabContent data={projectData} />
              ) : (
                <FarmTabContent data={projectData} />
              )}
            </div>
          </main>

          <ProjectDetailSideBar projectData={projectData} isApplied={false} onAction={() => {}} />
        </div>
      </div>
    </div>
  );
}