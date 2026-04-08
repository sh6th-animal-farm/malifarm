import type { MyPageProjectDTO } from "@/types/myPageType";

const normalizeStatus = (status?: string | null) => {
  if (!status) return "";
  if (status === "종료" || status === "종료됨" || status === "COMPLETED" || status === "ENDED") {
    return "COMPLETED";
  }
  if (status === "취소" || status === "취소됨" || status === "CANCELED" || status === "CANCELLED") {
    return "CANCELED";
  }
  if (status === "청약중" || status === "SUBSCRIPTION") return "SUBSCRIPTION";
  if (status === "공고중" || status === "ANNOUNCEMENT") return "ANNOUNCEMENT";
  if (status === "진행중" || status === "INPROGRESS") return "INPROGRESS";
  if (status === "당첨" || status === "APPROVED") return "APPROVED";
  if (status === "낙첨" || status === "REJECTED") return "REJECTED";
  return status;
};

const isJoinedProject = (project: MyPageProjectDTO) =>
  project.subscriptionStatus != null || project.statusText2 != null;

export const toTagVariant = (status: string) => {
  const normalized = normalizeStatus(status);

  if (normalized === "SUBSCRIPTION") return "warning" as const;
  if (normalized === "ANNOUNCEMENT") return "info" as const;
  if (normalized === "INPROGRESS") return "success" as const;
  if (normalized === "APPROVED") return "success" as const;
  if (normalized === "REJECTED") return "default" as const;
  if (normalized === "CANCELED") return "default" as const;
  if (normalized === "COMPLETED") return "default" as const;
  return "default" as const;
};

export const toProjectBadgeLabel = (project: MyPageProjectDTO) => {
  const projectStatus = normalizeStatus(project.statusText1 || project.projectStatus);
  const subscriptionStatus = normalizeStatus(project.statusText2 || project.subscriptionStatus);

  if (isJoinedProject(project)) {
    if (subscriptionStatus === "CANCELED" || projectStatus === "CANCELED") return "취소";
    if (projectStatus === "INPROGRESS") return "진행중";
    if (projectStatus === "COMPLETED") return "종료";
    return "청약중";
  }

  if (projectStatus === "SUBSCRIPTION") return "청약중";
  if (projectStatus === "INPROGRESS") return "진행중";
  if (projectStatus === "ANNOUNCEMENT") return "공고중";
  if (projectStatus === "COMPLETED") return "종료";
  if (projectStatus === "CANCELED") return "취소";
  return project.statusText1 || project.projectStatus || "-";
};

export const toStatusLabel = (project: MyPageProjectDTO) => {
  return toProjectBadgeLabel(project);
};

export const toSubStatusLabel = (_project: MyPageProjectDTO) => {
  return "";
};

export const toPeriodText = (project: MyPageProjectDTO) => {
  if (project.periodText) return project.periodText;
  if (project.projectStartDate && project.projectEndDate) {
    const start = project.projectStartDate.slice(0, 10);
    const end = project.projectEndDate.slice(0, 10);
    return `${start} ~ ${end}`;
  }
  return "-";
};
