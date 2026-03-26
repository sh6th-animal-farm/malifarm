type ProjectStatus = "SUBSCRIPTION" | "ANNOUNCEMENT" | "INPROGRESS";

type Project = {
  id: number;
  title: string;
  status: ProjectStatus;
  thumbnailUrl: string;
  upperDate: string;
  lowerDate: string;
  percent: number;
  dDay: string;
};

type Token = {
  tokenId: number;
  tokenName: string;
  marketPrice: number;
  changeRate: number;
};

export type { Project, Token, ProjectStatus };