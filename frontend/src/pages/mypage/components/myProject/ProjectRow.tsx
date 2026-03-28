import Tag from "@/components/common/Tag";
import Icon from "@/components/icon";
import type { MyPageProjectDTO } from "@/types/myPageType";
import {
  toPeriodText,
  toStatusLabel,
  toSubStatusLabel,
  toTagVariant,
} from "./projectFormatters";

interface ProjectRowProps {
  project: MyPageProjectDTO;
  index: number;
  totalCount: number;
  onMove: (projectId: number) => void;
}

export default function ProjectRow({
  project,
  index,
  totalCount,
  onMove,
}: ProjectRowProps) {
  const statusLabel = toStatusLabel(project);
  const statusVariant = toTagVariant(project.projectStatus || statusLabel);
  const subStatusLabel = toSubStatusLabel(project);
  const subStatusVariant = toTagVariant(subStatusLabel);
  const statusDotClassMap = {
    warning: "bg-warning",
    info: "bg-info",
    success: "bg-success",
    default: "bg-gray-300",
  } as const;

  return (
    <div
      className="group cursor-pointer transition-colors hover:bg-gray-50"
      onClick={() => onMove(project.projectId)}
    >
      <div
        className={`mx-4 flex items-center justify-between gap-3 py-3 md:mx-6 md:gap-5 md:py-4 ${
          index === 0 ? "pt-4 md:pt-6" : ""
        } ${
          index === totalCount - 1 ? "pb-4 md:pb-6" : ""
        } ${
          index === totalCount - 1 ? "" : "sm:border-b sm:border-gray-100"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-body-03 text-gray-900">{project.projectName}</p>
          <p className="mt-1.5 truncate font-caption-01 text-gray-500">{toPeriodText(project)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full sm:hidden ${statusDotClassMap[statusVariant]}`}
            aria-label={statusLabel}
          />
          <div className="hidden w-32 items-center justify-center sm:flex">
            <div className="flex items-center gap-1.5">
              <Tag variant={statusVariant} width="auto">{statusLabel}</Tag>
              {subStatusLabel ? (
                <Tag variant={subStatusVariant} width="auto">{subStatusLabel}</Tag>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-400 transition duration-200 group-hover:scale-110 group-hover:text-gray-600"
            aria-label={`${project.projectName} 상세 이동`}
            onClick={(event) => {
              event.stopPropagation();
              onMove(project.projectId);
            }}
          >
            <Icon name="chevron_right" size={16} color="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
