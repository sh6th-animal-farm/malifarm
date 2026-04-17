import type { Project, ProjectDTO, ProjectStatus } from '@/types/projectType';

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateRange = (start?: string | null, end?: string | null) => {
  const startText = formatDate(start);
  const endText = formatDate(end);
  if (startText === '-' && endText === '-') return '-';
  return `${startText} ~ ${endText}`;
};

const getDDay = (targetDate?: string | null) => {
  if (!targetDate) return '';
  const now = new Date();
  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) return '';

  const diff = target.getTime() - now.getTime();
  const day = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (day > 0) return `D-${day}`;
  if (day === 0) return 'D-Day';
  return '마감';
};

export const toCardModel = (dto: ProjectDTO | Project): Project => {
  const status = (dto as ProjectDTO).projectStatus ?? (dto as Project).status;
  const safeStatus: ProjectStatus =
    status === 'SUBSCRIPTION' ||
    status === 'ANNOUNCEMENT' ||
    status === 'INPROGRESS'
      ? status
      : 'SUBSCRIPTION';

  const isSubscription = safeStatus === 'SUBSCRIPTION';
  const isAnnouncement = safeStatus === 'ANNOUNCEMENT';

  const projectId = (dto as ProjectDTO).projectId ?? (dto as Project).id ?? 0;
  const projectName =
    (dto as ProjectDTO).projectName ?? (dto as Project).title ?? '';
  const projectRound = (dto as ProjectDTO).projectRound;
  const title = projectRound
    ? `${projectName} ${projectRound}회차`
    : projectName;

  const fallbackUpperDate = (dto as Project).upperDate ?? '';
  const upperDate =
    fallbackUpperDate ||
    (isSubscription
      ? formatDateRange(
          (dto as ProjectDTO).subscriptionStartDate,
          (dto as ProjectDTO).subscriptionEndDate,
        )
      : isAnnouncement
        ? formatDateRange(
            (dto as ProjectDTO).announcementStartDate,
            (dto as ProjectDTO).announcementEndDate,
          )
        : '');

  const fallbackLowerDate = (dto as Project).lowerDate ?? '';
  const lowerDate =
    fallbackLowerDate ||
    (isAnnouncement
      ? formatDateRange(
          (dto as ProjectDTO).subscriptionStartDate,
          (dto as ProjectDTO).subscriptionEndDate,
        )
      : safeStatus === 'INPROGRESS'
        ? formatDateRange(
            (dto as ProjectDTO).projectStartDate,
            (dto as ProjectDTO).projectEndDate,
          )
        : '');

  const dDayTarget = isSubscription
    ? ((dto as ProjectDTO).subscriptionEndDate ??
      (dto as Project).countdownTarget)
    : isAnnouncement
      ? ((dto as ProjectDTO).announcementEndDate ??
        (dto as Project).countdownTarget)
      : null;

  const expectedReturn =
    (dto as ProjectDTO).expectedReturn ?? (dto as Project).expectedReturn ?? 0;
  return {
    id: projectId,
    title,
    status: safeStatus,
    isStarred:
      (dto as ProjectDTO).isStarred || (dto as Project).isStarred || false,
    thumbnailUrl:
      (dto as ProjectDTO).thumbnailUrl ?? (dto as Project).thumbnailUrl ?? '',
    upperDate,
    lowerDate,
    percent:
      (dto as ProjectDTO).subscriptionRate ?? (dto as Project).percent ?? 0,
    dDay: (dto as Project).dDay ?? getDDay(dDayTarget),
    countdownTarget: dDayTarget,
    expectedReturn,
  };
};
