import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

interface SideBarProps {
  projectData: {
    projectId: number;
    projectStatus:
      | 'ANNOUNCEMENT'
      | 'SUBSCRIPTION'
      | 'INPROGRESS'
      | 'COMPLETED'
      | 'CANCELED';
    tickerSymbol: string;
    projectName: string;
    subscriptionRate: number;
    announcementEndDate: string;
    subscriptionEndDate: string;
    targetAmount: number;
    totalSupply: number;
    tokenId?: number;
  };
  isApplied: boolean;
  onAction: (tokenId?: number) => void;
  embedded?: boolean;
  className?: string;
}

export default function ProjectDetailSideBar({
  projectData,
  isApplied,
  onAction,
  embedded = false,
  className = '',
}: SideBarProps) {
  // D-Day 계산 로직
  const getDDay = () => {
    const now = new Date();
    const targetDate = new Date(
      projectData.projectStatus === 'ANNOUNCEMENT'
        ? projectData.announcementEndDate
        : projectData.subscriptionEndDate,
    );
    const diff = targetDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (daysLeft > 0) return `D-${daysLeft} 남음`;
    if (daysLeft === 0) return '오늘 마감';
    return '마감됨';
  };

  const isClosed = getDDay() === '마감됨';
  const tokenPrice = Math.floor(
    projectData.targetAmount / projectData.totalSupply,
  );

  const cardContent = (
    <div
      className={`relative rounded-lg bg-white ${embedded ? 'p-4 shadow-none' : 'p-8 shadow-std'}`}
    >
          {/* 1. 상태 배지 영역 */}
          <div className={`absolute ${embedded ? 'top-4 right-4' : 'top-8 right-8'}`}>
            {projectData.projectStatus === 'ANNOUNCEMENT' && (
              <Badge variant="info" children="공고중" />
            )}
            {projectData.projectStatus === 'SUBSCRIPTION' && (
              <Badge variant="warning" children="청약중" />
            )}
            {projectData.projectStatus === 'INPROGRESS' && (
              <Badge variant="success" children="진행중" />
            )}
            {projectData.projectStatus === 'COMPLETED' && (
              <Badge variant="default" children="종료" />
            )}
            {projectData.projectStatus === 'CANCELED' && (
              <Badge variant="default" children="취소" />
            )}
          </div>

          <p className="mb-1 font-caption-02 text-gray-400">
            {projectData.tickerSymbol}
          </p>
          <h1 className="font-header-02 text-gray-900 mb-5 pr-20 leading-tight">
            {projectData.projectName}
          </h1>

          {/* --- 상태별 레이아웃 분기 --- */}

          {/* [CASE 1] 공고중 또는 청약중 */}
          {(projectData.projectStatus === 'ANNOUNCEMENT' ||
            projectData.projectStatus === 'SUBSCRIPTION') && (
            <>
              <div className="mb-8 px-0.5">
                <div className="flex justify-between items-end mb-3">
                  <span className="font-caption-01 text-gray-900 font-medium">
                    {projectData.subscriptionRate}% 모집됨
                  </span>
                  <span className="font-caption-01 text-gray-400">
                    {getDDay()}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all duration-500"
                    style={{ width: `${projectData.subscriptionRate}%` }}
                  />
                </div>
              </div>

                <div className="space-y-3 mb-8">
                  <div className="bg-gray-50 p-5 rounded-lg">
                  <span className="font-caption-01 text-gray-500 block mb-3">
                    총 모집 금액
                  </span>
                  <strong className="font-header-02 text-gray-900 block leading-none">
                    {projectData.targetAmount?.toLocaleString()}원
                  </strong>
                </div>
                <div className="bg-white border border-green-600 p-5 rounded-lg">
                  <span className="font-caption-01 text-gray-500 block mb-3">
                    1 토큰 당 금액
                  </span>
                  <strong className="font-header-02 text-green-600 block leading-none">
                    {tokenPrice.toLocaleString()}원
                  </strong>
                </div>
              </div>

              {/* 버튼 로직: 공통 Button 컴포넌트로 교체 */}
              <div className="space-y-4">
                {projectData.projectStatus === 'ANNOUNCEMENT' ? (
                  // 1. 공고중일 때
                  <Button variant="subscriptionDisabled" width="100%">
                    청약 예정입니다
                  </Button>
                ) : isClosed ? (
                  // 2. 날짜가 마감되었을 때 (청약 기간 종료)
                  <Button variant="disabled" width="100%">
                    청약이 종료되었습니다
                  </Button>
                ) : isApplied ? (
                  // 3. 청약 기간 중 + 이미 신청했을 때 -> 취소 버튼
                  <Button
                    variant="subscriptionCancel"
                    width="100%"
                    onClick={() => onAction()}
                  >
                    청약 신청 취소하기
                  </Button>
                ) : (
                  // 4. 청약 기간 중 + 아직 신청 안 했을 때 -> 신청 버튼
                  <Button
                    variant="subscriptionCheck"
                    width="100%"
                    onClick={() => onAction()}
                  >
                    청약 신청하기
                  </Button>
                )}
                <p className="text-center font-caption-01 text-gray-400">
                  * 본 자산은 kh 증권에 실시간으로 기록됩니다.
                </p>
              </div>
            </>
          )}

          {/* [CASE 2] 진행중 */}
          {projectData.projectStatus === 'INPROGRESS' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                <span className="font-caption-01 text-gray-500 block mb-2">
                  현재 토큰가 (Market Price)
                </span>
                <div className="flex items-baseline gap-2">
                  <strong className="font-header-02 text-gray-900 text-2xl">
                    {tokenPrice.toLocaleString()} 원
                  </strong>
                  <span className="text-error font-caption-01 font-bold">
                    ▲ 0.0%
                  </span>
                </div>
              </div>
              <Button
                variant="default"
                width="100%"
                onClick={() => onAction(projectData.tokenId)}
              >
                토큰 거래소 바로가기
              </Button>
            </div>
          )}

          {/* [CASE 3] 종료 또는 취소 */}
          {(projectData.projectStatus === 'COMPLETED' ||
            projectData.projectStatus === 'CANCELED') && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <span className="font-caption-01 text-gray-500 block mb-2">
                  최종 토큰가
                </span>
                <strong className="font-header-02 text-gray-900 text-2xl">
                  {tokenPrice.toLocaleString()} 원
                </strong>
              </div>
              <Button variant="subscriptionEnd" width="100%">
                종료된 프로젝트입니다.
              </Button>
            </div>
          )}
        </div>
  );

  if (embedded) {
    return cardContent;
  }

  return (
    <aside className={`col-span-12 lg:col-span-4 px-0 ${className}`}>
      <div className="sticky top-[96px]">{cardContent}</div>
    </aside>
  );
}
