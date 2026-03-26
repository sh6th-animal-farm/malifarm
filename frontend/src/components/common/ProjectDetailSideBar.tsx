import React from 'react';

interface SideBarProps {
  projectData: {
    projectId: number;
    projectStatus: 'ANNOUNCEMENT' | 'SUBSCRIPTION' | 'INPROGRESS' | 'COMPLETED' | 'CANCELED';
    tickerSymbol: string;
    projectName: string;
    subscriptionRate: number;
    announcementEndDate: string;
    subscriptionEndDate: string;
    targetAmount: number;
    totalSupply: number;
    tokenId?: string;
  };
  isApplied: boolean;
  onAction: () => void;
}

export default function ProjectDetailSideBar({ projectData, isApplied, onAction }: SideBarProps) {
  // D-Day 계산 로직
  const getDDay = () => {
    const now = new Date();
    const targetDate = new Date(
      projectData.projectStatus === 'ANNOUNCEMENT' 
        ? projectData.announcementEndDate 
        : projectData.subscriptionEndDate
    );
    const diff = targetDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (daysLeft > 0) return `D-${daysLeft} 남음`;
    if (daysLeft === 0) return "오늘 마감";
    return "마감됨";
  };

  const isClosed = getDDay() === "마감됨";
  const tokenPrice = Math.floor(projectData.targetAmount / projectData.totalSupply);

  return (
    <aside className="col-span-12 lg:col-span-4 px-0">
      <div className="sticky top-[96px]">
        <div className="relative p-8 bg-white border border-gray-100 rounded-[var(--radius-m)] shadow-std">
          
          {/* 1. 상태 배지 영역 */}
          <div className="absolute top-8 right-8">
            {projectData.projectStatus === 'ANNOUNCEMENT' && (
              <span className="px-3.5 py-1.5 bg-info-light text-info rounded-[var(--radius-m)] font-button-02 font-semibold">공고중</span>
            )}
            {projectData.projectStatus === 'SUBSCRIPTION' && (
              <span className="px-3.5 py-1.5 bg-warning-light text-warning rounded-[var(--radius-m)] font-button-02 font-semibold">청약중</span>
            )}
            {projectData.projectStatus === 'INPROGRESS' && (
              <span className="px-3 py-1 bg-green-0 text-green-700 rounded-[var(--radius-s)] font-caption-03 font-bold">진행중</span>
            )}
            {projectData.projectStatus === 'COMPLETED' && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-[var(--radius-s)] font-caption-03 font-bold">종료</span>
            )}
            {projectData.projectStatus === 'CANCELED' && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-[var(--radius-s)] font-caption-03 font-bold">취소</span>
            )}
          </div>

          <p className="font-caption-01 text-gray-400 mb-2 font-medium">{projectData.tickerSymbol}</p>
          <h1 className="font-header-02 text-gray-900 mb-5 leading-tight">{projectData.projectName}</h1>

          {/* --- 상태별 레이아웃 분기 --- */}

          {/* [CASE 1] 공고중 또는 청약중 */}
          {(projectData.projectStatus === 'ANNOUNCEMENT' || projectData.projectStatus === 'SUBSCRIPTION') && (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                  <span className="font-caption-01 text-gray-900 font-medium">{projectData.subscriptionRate}% 모집됨</span>
                  <span className="font-caption-01 text-gray-400">{getDDay()}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${projectData.subscriptionRate}%` }} />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="bg-gray-100 p-5 rounded-[var(--radius-m)]">
                  <span className="font-caption-01 text-gray-500 block mb-3">총 모집 금액 (Target)</span>
                  <strong className="text-[28px] font-header-02 text-gray-900 block leading-none">
                    {projectData.targetAmount?.toLocaleString()}원
                  </strong>
                </div>
                <div className="bg-white border border-green-50 p-5 rounded-[var(--radius-m)]">
                  <span className="font-caption-01 text-gray-500 block mb-3">1 토큰당 청약 금액</span>
                  <strong className="text-[28px] font-header-02 text-green-600 block leading-none">
                    {tokenPrice.toLocaleString()}원
                  </strong>
                </div>
              </div>

              {/* 버튼 로직 */}
              <div className="space-y-6">
                {projectData.projectStatus === 'ANNOUNCEMENT' ? (
                  <button className="w-full py-6 bg-gray-400 text-white rounded-[var(--radius-m)] font-button-01 cursor-not-allowed" disabled>
                    청약 예정입니다
                  </button>
                ) : (projectData.projectStatus === 'SUBSCRIPTION' && isClosed) ? (
                  <button className="w-full py-6 bg-gray-400 text-white rounded-[var(--radius-m)] font-button-01 cursor-not-allowed" disabled>
                    청약이 종료되었습니다
                  </button>
                ) : isApplied ? (
                  <button onClick={onAction} className="w-full py-6 bg-white text-error border-[1.5px] border-error rounded-[var(--radius-m)] font-button-01 hover:bg-error-light transition-colors">
                    청약 신청 취소하기
                  </button>
                ) : (
                  <button onClick={onAction} className="w-full py-6 bg-green-600 text-white rounded-[var(--radius-m)] font-button-01 shadow-lg shadow-green-500/20 transition-all">
                    청약 신청하기
                  </button>
                )}
                <p className="text-center font-caption-01 text-gray-400">* 본 자산은 세준 증권 원장에 실시간 기록됩니다.</p>
              </div>
            </>
          )}

          {/* [CASE 2] 진행중 */}
          {projectData.projectStatus === 'INPROGRESS' && (
            <div className="space-y-6">
              <div className="bg-gray-100 p-6 rounded-[var(--radius-m)]">
                <span className="font-caption-01 text-gray-500 block mb-2">현재 토큰가 (Market Price)</span>
                <div className="flex items-baseline gap-2">
                  <strong className="font-header-02 text-gray-900 text-2xl">{tokenPrice.toLocaleString()} 원</strong>
                  <span className="text-error font-caption-01 font-bold">▲ 0.0%</span>
                </div>
              </div>
              <button 
                onClick={() => window.location.href=`/token/${projectData.tokenId}`}
                className="w-full py-5 bg-gray-900 text-white rounded-[var(--radius-m)] font-button-01 hover:bg-black transition-all"
              >
                토큰 거래소 바로가기
              </button>
            </div>
          )}

          {/* [CASE 3] 종료 또는 취소 */}
          {(projectData.projectStatus === 'COMPLETED' || projectData.projectStatus === 'CANCELED') && (
            <div className="space-y-6">
              <div className="bg-gray-100 p-6 rounded-[var(--radius-m)]">
                <span className="font-caption-01 text-gray-500 block mb-2">최종 토큰가</span>
                <strong className="font-header-02 text-gray-900 text-2xl">{tokenPrice.toLocaleString()} 원</strong>
              </div>
              <button className="w-full py-6 bg-gray-400 text-white rounded-[var(--radius-m)] font-button-01 cursor-not-allowed" disabled>
                종료된 프로젝트입니다.
              </button>
            </div>
          )}

        </div>
      </div>
    </aside>
  );
}