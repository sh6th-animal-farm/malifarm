import type { ProjectList as ProjectType } from '@/types/projectType';
import EmptyState from '@/components/common/EmptyState';
import ProjectCard from '@/components/common/ProjectCard';

interface ProjectGridProps {
  projects: ProjectType[];
  activeStatus: string;
  isLoading: boolean;
  onToggleStar: (projectId: number) => void;
  onBeforeNavigateDetail?: () => void;
  detailNavigationState?: Record<string, unknown>;
}

export default function ProjectGrid({
  projects,
  activeStatus,
  isLoading,
  onToggleStar,
  onBeforeNavigateDetail,
  detailNavigationState,
}: ProjectGridProps) {
  // 1. 로딩 중 UI
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A9F2E]"></div>
      </div>
    );
  }

  // 2. 필터링 및 데이터 가공 (카드에 필요한 형태로 브릿지 연결)
  const filteredAndFormatted = projects
    .filter((p) => {
      const isHiddenStatus =
        p.projectStatus === 'CANCELED' || p.projectStatus === 'COMPLETED';
      if (isHiddenStatus) return false;
      if (activeStatus === 'ALL') return true;
      return p.projectStatus === activeStatus;
    })
    .map((p) => {
      // 날짜 가공 함수
      const formatDate = (dateStr: string) =>
        dateStr ? dateStr.split('T')[0] : '';

      // 카드 컴포넌트가 기대하는 필드로 매핑
      return {
        ...p,
        isFavorite: p.isStarred,
        id: p.projectId,
        title: p.projectName,
        status:
          p.projectStatus === 'SUBSCRIPTION' ||
          p.projectStatus === 'ANNOUNCEMENT' ||
          p.projectStatus === 'INPROGRESS'
            ? p.projectStatus
            : 'ANNOUNCEMENT',
        percent: p.subscriptionRate,
        upperDate: `${formatDate(p.subscriptionStartDate)} ~ ${formatDate(p.subscriptionEndDate)}`,
        lowerDate: `${formatDate(p.projectStartDate)} ~ ${formatDate(p.projectEndDate)}`,
        // 타이머 기준일 설정
        countdownTarget:
          p.projectStatus === 'SUBSCRIPTION'
            ? p.subscriptionEndDate
            : p.projectStatus === 'ANNOUNCEMENT'
              ? p.subscriptionStartDate
              : null,
        thumbnailUrl:
          p.thumbnailUrl ||
          'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1000',
        dDay: '',
      };
    });

  // 3. 데이터가 없을 때 UI
  if (filteredAndFormatted.length === 0) {
    return (
      <EmptyState message="해당 조건에 맞는 프로젝트가 없습니다." />
    );
  }

  return (
    <div className="grid grid-cols-1 min-[768px]:grid-cols-2 min-[1024px]:grid-cols-3 gap-8">
      {filteredAndFormatted.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          starred={project.isFavorite}
          onToggleStar={onToggleStar}
          onBeforeNavigateDetail={onBeforeNavigateDetail}
          detailNavigationState={detailNavigationState}
        />
      ))}
    </div>
  );
}
