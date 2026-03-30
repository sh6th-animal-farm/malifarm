import type { MyPageProjectDTO } from "@/types/myPageType";

export const toTagVariant = (status: string) => {
  if (status === "SUBSCRIPTION" || status === "청약중") return "warning" as const;
  if (status === "ANNOUNCEMENT" || status === "공고중") return "info" as const;
  if (status === "INPROGRESS" || status === "진행중") return "success" as const;
  if (status === "APPROVED" || status === "당첨") return "success" as const;
  if (status === "REJECTED" || status === "낙첨") return "default" as const;
  if (status === "CANCELED" || status === "취소") return "default" as const;
  return "default" as const;
};

export const toStatusLabel = (project: MyPageProjectDTO) => {
  if (project.statusText1) {
    if (project.statusText1 === "종료") return "종료됨";
    if (project.statusText1 === "CANCELED" || project.statusText1 === "CANCELLED") return "";
    return project.statusText1;
  }
  if (project.projectStatus === "CANCELED" || project.projectStatus === "CANCELLED") return "";
  if (project.projectStatus === "SUBSCRIPTION") return "청약중";
  if (project.projectStatus === "ANNOUNCEMENT") return "공고중";
  if (project.projectStatus === "INPROGRESS") return "진행중";
  if (project.projectStatus === "ENDED") return "종료됨";
  return project.projectStatus || "-";
};

export const toSubStatusLabel = (project: MyPageProjectDTO) => {
  if (!project.statusText2) return "";
  if (project.statusText2 === "당첨" || project.statusText2 === "APPROVED") return "";
  if (
    project.statusText2 === "취소" ||
    project.statusText2 === "CANCELED" ||
    project.statusText2 === "CANCELLED"
  ) {
    return "낙첨";
  }
  if (project.statusText2 === "종료") return "종료됨";
  return project.statusText2;
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
