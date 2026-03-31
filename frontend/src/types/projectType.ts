interface ProjectData {
  projectId: number;
  projectName: string;
  images: string[];
  expectedReturn: number;
  subscriptionRate: number;
  actualAmount: number;
  targetAmount: number;
  totalSupply: number;
  minAmountPerInvestor: number;
  projectStatus:
    | 'ANNOUNCEMENT'
    | 'SUBSCRIPTION'
    | 'INPROGRESS'
    | 'CANCELED'
    | 'COMPLETED';
  managerCount: number;
  method: string;
  projectDescription: string;
  temperatureInside: number[];

  farm: {
    addressSido: string;
    area: number;
    // 필요한 다른 필드가 있다면 여기에 추가 (예: addressSigungu 등)
  };
}

type ProjectStatus = 'SUBSCRIPTION' | 'ANNOUNCEMENT' | 'INPROGRESS';

type ProjectDTO = {
  projectId: number;
  projectName: string;
  projectRound?: number | null;
  projectStatus: ProjectStatus;
  thumbnailUrl?: string | null;
  subscriptionRate?: number | null;
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
  announcementStartDate?: string | null;
  announcementEndDate?: string | null;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
};

type Project = {
  id: number;
  title: string;
  status: ProjectStatus;
  thumbnailUrl: string;
  upperDate: string;
  lowerDate: string;
  percent: number;
  dDay: string;
  countdownTarget?: string | null;
};

type Token = {
  tokenId: number;
  tokenName: string;
  marketPrice: number;
  changeRate: number;
};

interface Wallet {
  accountNo: string;
  bankName: string;
  cashBalance: number;
  frozenAmount: number;
  totalPurchasedValue: number;
  totalMarketValue: number;
  totalBalance: number;
  profitLoss: number;
  profitLossRate: number;
}

interface ProjectList {
  projectId: number;
  projectName: string;
  projectRound: number;
  subscriptionRate: number;
  projectStatus:
    | 'PREPARING'
    | 'ANNOUNCEMENT'
    | 'SUBSCRIPTION'
    | 'INPROGRESS'
    | 'COMPLETED'
    | 'CANCELED';

  announcementStartDate: string;
  announcementEndDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  projectStartDate: string;
  projectEndDate: string;
  expectedReturn: number;
  isStarred: boolean;

  // ===== 농가 정보 =====
  farmId: number;
  farmName: string;
  addressSido: string;
  addressSigungu: string;
  addressStreet: string;
  addressDetails: string;
  latitude: number;
  longitude: number;
  altitude: number;
  farmType: string;
  area: number;
  description: string;
  thumbnailUrl: string;

  openAt: string;
  id?: number;
  title?: string;
  status?: string;
  countdownTarget?: string | null;
  upperDate?: string;
  lowerDate?: string;
  percent?: number;
}

export type {
  ProjectData,
  ProjectDTO,
  Project,
  Token,
  ProjectStatus,
  Wallet,
  ProjectList,
};
