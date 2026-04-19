import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import type { ProjectData } from '@/types/projectType';

import TabMenu from '@/components/common/TabMenu';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import ImageCarousel from './components/ImageCarousel';
import FarmTabContent from './components/FarmTabContent';
import ProjectDetailSideBar from './components/ProjectDetailSideBar';
import InvestTabContent from './components/InvestTabContent';
import SubscriptionModal from './components/SubscriptionModal';
import AccountCheckFailModal from './components/AccountCheckFailModal';
import { authApi } from '@/api/authApi';
import { subscriptionApi } from '@/api/subscriptionApi';
import Toast from '@/components/common/Toast';
import PageShell from '@/components/layout/PageShell';
import type { UserInvestmentLimitDTO } from '@/types/subscriptionType';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string | undefined }>();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invest');
  const [activeModal, setActiveModal] = useState<
    'subscription' | 'accountFail' | null
  >(null);
  const [currentUserId, setCurrentUserId] = useState<
    string | number | undefined
  >(undefined);
  const navigate = useNavigate();
  const [isApplied, setIsApplied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [userInvestmentLimit, setUserInvestmentLimit] =
    useState<UserInvestmentLimitDTO | null>(null);
  const handleCloseToast = useCallback(() => {
    setToastMsg(null);
  }, []);

  const fetchData = async (projectId: string) => {
    setIsLoading(true);
    try {
      const projectRes = await projectApi.getProjectDetail(projectId);
      setProjectData(projectRes);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'mobile-project-detail-title',
          projectRes.projectName ?? '프로젝트 상세',
        );
      }

      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = (await subscriptionApi.checkStatus(
            Number(projectId),
          )) as any;
          const status =
            res.data?.isApplied !== undefined
              ? res.data.isApplied
              : res.isApplied;

          setIsApplied(status);
        } catch (err) {
          console.error('청약 상태 조회 실패:', err);
          setIsApplied(false);
        }
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setProjectData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
      return;
    }
    setIsLoading(false);
  }, [id]);

  // 사이드바 버튼 클릭 시 실행될 함수
  const handleAction = async () => {
    if (!projectData) return;

    if (projectData.projectStatus === 'INPROGRESS') {
      navigate(`/token/${id}`);
      return;
    }
    if (isApplied) {
      if (window.confirm('청약을 취소하시겠습니까?')) {
        try {
          await subscriptionApi.cancelSubscription(Number(id));
          setToastMsg('청약이 취소되었습니다.');
          if (id) await fetchData(id);
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.message || '취소 중 오류가 발생했습니다.';
          console.error('실제 취소 오류 발생:', errorMsg);
          alert(errorMsg);
        }
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      const user = (await authApi.getUser()) as any;
      setCurrentUserId(user.userId);
      const investmentLimit = await subscriptionApi.getUserInvestmentLimit();
      setUserInvestmentLimit(investmentLimit);
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

  if (isLoading) {
    return (
      <PageShell>
        <section className="layout-container py-8 lg:py-20">
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-gray-400">
            <div className="mlf-spinner" />
            <p className="font-body-01">프로젝트 정보를 불러오는 중입니다.</p>
          </div>
        </section>
      </PageShell>
    );
  }

  if (!projectData) {
    return (
      <PageShell>
        <section className="layout-container py-8 lg:py-20">
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">
            <EmptyState
              message="프로젝트 정보를 찾을 수 없습니다."
              className="mb-0 py-0"
            />
            <Button
              variant="default"
              width={180}
              height={48}
              onClick={() => navigate('/project')}
            >
              목록으로 돌아가기
            </Button>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className='md:bg-white'>
        <section className="layout-container pb-4 md:py-20">
          <div className="grid grid-cols-12 gap-[24px]">
            <main className="col-span-12 lg:col-span-8 px-0">
              <div className="-mx-4 md:mx-0">
                <ImageCarousel images={projectData.images} />
              </div>

              <div className="mt-4 lg:hidden">
                <ProjectDetailSideBar
                  embedded
                  projectData={projectData}
                  isApplied={isApplied}
                  onAction={handleAction}
                />
              </div>

              <TabMenu
                items={[
                  { text: '투자 정보', value: 'invest' },
                  { text: '농장 정보', value: 'farm' },
                ]}
                gap={8}
                currentValue={activeTab}
                onTabChange={setActiveTab}
              />

              <div className="w-full">
                {activeTab === 'invest' ? (
                  <InvestTabContent data={projectData} />
                ) : (
                  <FarmTabContent data={projectData} />
                )}
              </div>
            </main>

            <ProjectDetailSideBar
              className="hidden lg:block"
              projectData={projectData}
              isApplied={isApplied}
              onAction={handleAction}
            />
          </div>
        </section>
      </div>
      {projectData && (
        <SubscriptionModal
          isOpen={activeModal === 'subscription'}
          onClose={() => setActiveModal(null)}
          setToastMsg={setToastMsg}
          onSuccess={() => {
            if (id) fetchData(id);
          }}
          projectData={{
            userId: currentUserId || '',
            projectId: String(projectData.projectId),
            tokenId: Number(projectData.tokenId) || 0,
            title: projectData.projectName,
            price: Math.floor(
              projectData.targetAmount / projectData.totalSupply,
            ),
            thumbnailUrl: projectData.images?.[0] ?? '',
            userLimit: userInvestmentLimit?.availableLimit ?? 0,
            minAmountPerInvestor: projectData.minAmountPerInvestor,
          }}
        />
      )}

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
        onPrimaryClick={() => navigate('/mypage/wallet')}
      />

      {toastMsg && <Toast message={toastMsg} onClose={handleCloseToast} />}
    </PageShell>
  );
}
