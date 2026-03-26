import type { ProjectStatus } from "@/pages/home/types/type";

function StatusBadge({ status }: { status: ProjectStatus }) {
  const badgeMap: Record<ProjectStatus, string> = {
    SUBSCRIPTION: "청약중",
    ANNOUNCEMENT: "공고중",
    INPROGRESS: "운영중",
  };

  const colorClass =
    status === "SUBSCRIPTION"
      ? "bg-green-600"
      : status === "ANNOUNCEMENT"
        ? "bg-warning"
        : "bg-info";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold text-white ${colorClass}`}
    >
      {badgeMap[status]}
    </span>
  );
}

export default StatusBadge;