interface ProjectData {
  projectId: number;
  farmId: number;
  projectName: string;
  projectRound: number;
  projectDescription: string;
  tokenName: string;
  tickerSymbol: string;
  targetAmount: number;
  totalSupply: number;
  minAmountPerInvestor: number;
  maxAmountPerInvestor: number;
  actualAmount: number;
  expectedReturn: number;
  roi: number;
  managerCount: number;
  announcementStartDate: string;
  announcementEndDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  resultAnnouncementDate: string;
  projectStartDate: string;
  projectEndDate: string;
  images: string[];
  subscriptionRate: number;
  projectStatus:
    | 'ANNOUNCEMENT'
    | 'SUBSCRIPTION'
    | 'INPROGRESS'
    | 'CANCELED'
    | 'COMPLETED';
  method: string;
  temperatureInside: number[];
  humidityInside: number[];

  farm: {
    addressSido: string;
    area: number;
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
  expectedReturn?: number | null;
};

type AdminProject = {
  id: number;
  title: string;
  status: ProjectStatus;
  thumbnailUrl: string;
  upperDate: string;
  lowerDate: string;
  percent: number;
  dDay: string;
  countdownTarget?: string | null;
  isStarred?: boolean;
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
