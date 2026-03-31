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
import { subscriptionApi } from '@/api/subscriptionApi';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string | undefined }>();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invest');
  const [activeModal, setActiveModal] = useState<
    'subscription' | 'accountFail' | null
  >(null);
  const [currentUserId, setCurrentUserId] = useState<
    string | number | undefined
  >(undefined);

  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    const fetchData = async (projectId: string) => {
      try {
        setLoading(true);
        const projectRes = await projectApi.getProjectDetail(projectId);
        setProjectData(projectRes.data || projectRes);

        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            // apiClient가 이미 res.data를 반환하므로 바로 꺼내 씁니다.
            const statusData = await subscriptionApi.checkStatus(
              Number(projectId),
            );

            // 백엔드 Map<String, Object> data에 넣은 'isApplied'를 바로 참조
            // 만약 statusData 자체가 boolean이라면 setIsApplied(statusData)
            setIsApplied(statusData.isApplied);
          } catch (err) {
            console.error('청약 상태 조회 실패:', err);
            setIsApplied(false);
          }
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData(id);
  }, [id]);

  // ✅ 사이드바 버튼 클릭 시 실행될 함수
  const handleAction = async () => {
    if (isApplied) {
      if (window.confirm('청약을 취소하시겠습니까?')) {
        try {
          await subscriptionApi.cancelSubscription(Number(id));
          setIsApplied(false);
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          if (errorMsg.includes('청약 취소가 완료되었습니다')) {
            setIsApplied(false);
          } else {
            console.error('실제 취소 오류 발생:', errorMsg);
          }
        }
      }
      return;
    }

    // 2. 청약이 안 된 상태라면 기존 로그인/계좌 체크 후 모달 오픈
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      const user = (await authApi.getUser()) as any;
      setCurrentUserId(user.userId);
      const checkacc = await projectApi.getCheckAccount(user.userId);

      if (checkacc === true) {
        setActiveModal('subscription');
      } else {
        setActiveModal('accountFail');
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center font-bold text-gray-400">
        로딩 중...
      </div>
    );
  if (!projectData)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">
        정보 없음
      </div>
    );

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
                { text: '투자 정보', value: 'invest' },
                { text: '농장 정보', value: 'farm' },
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

          <ProjectDetailSideBar
            projectData={projectData}
            isApplied={isApplied}
            onAction={handleAction}
          />
        </div>
      </div>
      {/* 1. 청약 신청 모달 */}
      {projectData && (
        <SubscriptionModal
          isOpen={activeModal === 'subscription'}
          onClose={() => setActiveModal(null)}
          projectData={{
            userId: currentUserId || '',
            projectId: String(projectData.projectId),
            tokenId: Number(projectData.tokenId) || 0,
            title: projectData.projectName,
            price: Math.floor(
              projectData.targetAmount / projectData.totalSupply,
            ),
            userLimit: 500000000, // API 연결 시 실제 값으로 대체
            walletBalance: 0, // API 연결 시 실제 값으로 대체
            minAmountPerInvestor: 10000, // 예시
          }}
        />
      )}

      {/* 2. 계좌 확인 실패 모달 */}
      <AccountCheckFailModal
        isOpen={activeModal === 'accountFail'}
        onClose={() => setActiveModal(null)}
        title="계좌 연동이 필요합니다"
        description={
          <>
            청약 신청을 위해
            <br />
            증권 계좌 연동이 필요합니다.
          </>
        }
        primaryButtonText="계좌 연동하러 가기"
        secondaryButtonText="다음에 하기"
        onPrimaryClick={() => Navigate('/mypage/account')} // 마이페이지 계좌연동으로 이동
      />
    </div>
  );
}
