import { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import type { ProjectData } from '@/types/projectType';

// 분리한 컴포넌트들 import
import TabMenu from '@/components/common/TabMenu';
import ImageCarousel from './components/ImageCarousel';
import FarmTabContent from './components/FarmTabContent';
import ProjectDetailSideBar from './components/ProjectDetailSideBar';
import InvestTabContent from './components/InvestTabContent';
import SubscriptionModal from './components/SubscriptionModal';
import AccountCheckFailModal from './components/AccountCheckFailModal';
import { authApi } from '@/api/authApi';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string | undefined }>();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invest');

  // 모달 상태 관리: 'subscription' | 'accountFail' | null
  const [activeModal, setActiveModal] = useState<'subscription' | 'accountFail' | null>(null);

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

  // ✅ 사이드바 버튼 클릭 시 실행될 함수
  const handleAction = async () => {
    const token = localStorage.getItem('accessToken');

    // 1. 로그인 여부 확인
    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }
    try {
      // 2. 계좌 연동 여부 확인 (authApi 사용)
      const user = await authApi.getUser() as any;
      const checkacc = await projectApi.getCheckAccount(user.userId) as unknown as boolean;
      
      // 서버 응답 구조에 따라 userData.hasAccount 또는 userData.accountNo 등을 체크
      if (checkacc === true) { 
        setActiveModal('subscription');
      } else {
        setActiveModal('accountFail');
      }
    } catch (error) {
      // 에러 처리는 apiClient 인터셉터에서 수행하지만, 
      // 추가적인 로직이 필요하다면 여기서 처리합니다.
      console.error("사용자 정보 조회 실패:", error);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center font-bold text-gray-400">로딩 중...</div>;
  if (!projectData) return <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">정보 없음</div>;

  return (
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

          <ProjectDetailSideBar projectData={projectData} isApplied={false} onAction={handleAction} />
        </div>
      </div>
      {/* 1. 청약 신청 모달 */}
      {projectData && (
        <SubscriptionModal 
          isOpen={activeModal === 'subscription'}
          onClose={() => setActiveModal(null)}
          projectData={{
            projectId: String(projectData.projectId),
            tokenId: Number(projectData.tokenId) || 0,
            title: projectData.projectName,
            price: Math.floor(projectData.targetAmount / projectData.totalSupply),
            userLimit: 50000000, // API 연결 시 실제 값으로 대체
            walletBalance: 0, // API 연결 시 실제 값으로 대체
            minAmountPerInvestor: 10000 // 예시
          }}
        />
      )}

      {/* 2. 계좌 확인 실패 모달 */}
      <AccountCheckFailModal 
        isOpen={activeModal === 'accountFail'}
        onClose={() => setActiveModal(null)}
        title="계좌 연동이 필요합니다"
        description={<>청약 신청을 위해<br/>증권 계좌 연동이 필요합니다.</>}
        primaryButtonText="계좌 연동하러 가기"
        secondaryButtonText="다음에 하기"
        onPrimaryClick={() => Navigate('/mypage/account')} // 마이페이지 계좌연동으로 이동
      />
    </div>
  );
}