import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/button";
import Badge from "@/components/common/Badge";
import Icon from "@/components/icon";
import type { Project } from "@/types/projectType";

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
  const [now, setNow] = useState(() => Date.now());
  const isSubscription = project.status === "SUBSCRIPTION";
  const isAnnouncement = project.status === "ANNOUNCEMENT";
  const isInProgress = project.status === "INPROGRESS";

  const badgeVariant = isSubscription
    ? "warning"
    : isAnnouncement
      ? "info"
      : "success";
  const badgeLabel = isSubscription
    ? "청약중"
    : isAnnouncement
      ? "공고중"
      : "진행중";

  const timerLabel = isSubscription
    ? "마감까지"
    : isAnnouncement
      ? "시작까지"
      : "";
  const shouldShowTimer = isSubscription || isAnnouncement;

  const buttonVariant = isSubscription
    ? "default-warning"
    : isAnnouncement
      ? "default-info"
      : "default";

  const buttonLabel = isSubscription
    ? "청약 하기"
    : isAnnouncement
      ? "공고 보기"
      : "토큰 구매";

  useEffect(() => {
    if (!shouldShowTimer || !project.countdownTarget) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [shouldShowTimer, project.countdownTarget]);

  const getCountdownText = () => {
    if (!project.countdownTarget) return "";

    const end = new Date(project.countdownTarget).getTime();
    if (Number.isNaN(end)) return "";

    const diffMs = end - now;
    if (diffMs <= 0) return "청약 마감";

    const totalSec = Math.floor(diffMs / 1000);
    const hours = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSec % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <article
      className="group relative overflow-hidden rounded-lg bg-white shadow-std transition duration-200 hover:-translate-y-1 cursor-pointer"
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
          className="h-full w-full object-cover bg-gray-100 transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute top-4 left-4">
          <Badge variant={badgeVariant} width="auto" height={28}>
            {badgeLabel}
          </Badge>
        </div>

        <button
          type="button"
          className="absolute top-3 right-4 flex h-9 w-9 items-center justify-center cursor-pointer"
          aria-label="관심 프로젝트"
          onClick={(event) => {
            event.stopPropagation();
            onToggleStar(project.id);
          }}
        >
          <span className="inline-flex transition-transform duration-150 hover:scale-105">
            <Icon
              name="heart_filled"
              size={29}
              color={starred ? "var(--color-error)" : "var(--color-gray-0)"}
            />
          </span>
        </button>
      </div>

      <div
        className={`flex flex-col p-6 ${
          isSubscription ? "gap-6" : isAnnouncement ? "gap-5" : "gap-8"
        }`}
      >
        <div>
          <h3 className="font-subtitle-01 text-gray-900 mb-1">
            {project.title}
          </h3>
          {!isInProgress ? (
            <div className="flex items-start justify-between gap-3 font-caption-01 text-gray-500">
              <span>{project.upperDate}</span>
              <span className="text-right">
                <strong className="mr-1 text-error">{timerLabel}</strong>
                <strong className="text-error">
                  {shouldShowTimer ? getCountdownText() : ""}
                </strong>
              </span>
            </div>
          ) : null}
        </div>

        {isSubscription ? (
          <div>
            <div className="mb-2 inline-flex items-end gap-1 text-green-600">
              <strong className="font-body-03">{project.percent}% 모집</strong>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-gray-100"
              aria-hidden="true"
            >
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
              <strong className="text-right text-gray-800">
                {project.lowerDate}
              </strong>
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
