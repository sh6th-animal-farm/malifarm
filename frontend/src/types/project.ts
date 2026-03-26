export interface ProjectData {
  projectId: number;
  projectName: string;
  images: string[];
  expectedReturn: number;
  subscriptionRate: number;
  actualAmount: number;
  targetAmount: number;
  totalSupply: number;
  minAmountPerInvestor: number;
  projectStatus: 'ANNOUNCEMENT' | 'SUBSCRIPTION' | 'INPROGRESS' | 'CANCELED' | 'COMPLETED';
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