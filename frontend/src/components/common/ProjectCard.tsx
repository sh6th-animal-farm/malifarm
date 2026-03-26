import type { Project } from "@/pages/Home/types/type";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/button";
import Badge from "@/components/common/tag";
import Icon from "@/components/icon";

function ProjectCard({
  project,
  starred,
  onToggleStar,
}: {
  project: Project;
  starred: boolean;
  onToggleStar: (projectId: number) => void;
}) {
  const navigate = useNavigate();
  const isSubscription = project.status === "SUBSCRIPTION";
  const isAnnouncement = project.status === "ANNOUNCEMENT";
  const isInProgress = project.status === "INPROGRESS";

  const badgeVariant = isSubscription
    ? "success"
    : isAnnouncement
      ? "warning"
      : "info";
  const badgeLabel = isSubscription ? "청약중" : isAnnouncement ? "공고중" : "운영중";

  const timerLabel = isSubscription ? "마감까지" : isAnnouncement ? "시작까지" : "";

  const buttonVariant = isSubscription
    ? "default"
    : isAnnouncement
      ? "default-warning"
      : "default-info";

  const buttonLabel = isSubscription
    ? "청약 하기"
    : isAnnouncement
      ? "공고 보기"
      : "토큰 구매";

  return (
    <article
      className="group relative overflow-hidden rounded-lg shadow-std transition duration-200 hover:-translate-y-1 cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/project/${project.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/project/${project.id}`);
        }
      }}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute top-4 left-4">
          <Badge variant={badgeVariant} width="auto" height={28}>
            {badgeLabel}
          </Badge>
        </div>

        <button
          type="button"
          className="absolute top-[18px] right-4 flex h-9 w-9 items-center justify-center cursor-pointer"
          aria-label="관심 프로젝트"
          onClick={(event) => {
            event.stopPropagation();
            onToggleStar(project.id);
          }}
        >
          <Icon
            name="heart_filled"
            size={30}
            color={starred ? "var(--color-error)" : "var(--color-gray-0)"}
          />
        </button>
      </div>

      <div
        className={`flex flex-col p-6 ${
          isSubscription ? "gap-6" : isAnnouncement ? "gap-5" : "gap-8"
        }`}
      >
        <h3 className="font-subtitle-01 text-gray-900">{project.title}</h3>

        {!isInProgress ? (
          <div className="flex items-start justify-between gap-3 font-caption-01 text-gray-500">
            <span>{project.upperDate}</span>
            <span className="text-right">
              <strong className="mr-1 text-error">{timerLabel}</strong>
              <strong className="text-error">{project.dDay}</strong>
            </span>
          </div>
        ) : null}

        {isSubscription ? (
          <div>
            <div className="mb-2 inline-flex items-end gap-1 text-green-600">
              <strong className="font-body-03">{project.percent}%</strong>
              <span className="font-button-02">모집</span>
            </div>
            <div className="h-[6px] overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
              <div
                className="h-full rounded-full bg-green-600"
                style={{ width: `${project.percent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 font-caption-01 text-gray-500">
            <p className="flex items-start justify-between gap-3">
              <span>{isAnnouncement ? "청약 예정일" : "운영 기간"}</span>
              <strong className="text-right text-gray-800">{project.lowerDate}</strong>
            </p>
            <p className="flex items-start justify-between gap-3">
              <span>{isAnnouncement ? "예상 수익률" : "현재 수익률"}</span>
              <strong className="text-gray-800">연 14.2%</strong>
            </p>
          </div>
        )}

        <Button variant={buttonVariant} width="100%" height={48}>
          {buttonLabel}
        </Button>
      </div>
    </article>
  );
}

export default ProjectCard;
