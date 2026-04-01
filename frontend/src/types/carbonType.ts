// src/types/carbon.ts

export interface UserBenefit {
  userMaxLimit: number;
  discountRate: number;
  currentPrice: number;
  myTokenBalance: number;
}

export interface CarbonInfo {
  projectId: number;
  cpType: string;
  vintageYear: string;
  cpTitle: string;
  productCertificate: string;
  initAmount: number;
  cpAmount: number;
  cpDetail: string;
  cpPrice: number;
}

export interface CarbonListDTO {
  cpId: number;
  thumbnailUrl: string;
  cpTitle: string;
  category: "REMOVAL" | "REDUCTION" | "ALL";
  vintageYear: string;
  cpAmount: number;
  cpPrice: number;
  projectId: number;
  userBenefit: UserBenefit;
}

export interface CarbonDetailDTO {
  carbonInfo: CarbonInfo;
  userBenefit: UserBenefit;
  addressSido: string;
  addressSigungu: string;
  addressStreet: string;
  addressDetails: string;
  farmName: string;
  thumbnailUrl: string;
}

export interface CarbonOrderQuote {
  cpId: number;
  cpTitle: string;
  orderAmount: number;
  unitPrice: number;
  supplyAmount: number;
  vatAmount: number;
  totalAmount: number;
  userMaxLimit: number;
  remainAmount: number;
  discountRate: number;
}

export interface PortOneResponse {
  success: boolean;
  imp_uid: string;
  merchant_uid: string;
  error_msg?: string;
}

export interface CustomWindow extends Window {
  IMP?: {
    init: (code: string) => void;
    request_pay: (params: Record<string, unknown>, callback: (rsp: PortOneResponse) => void) => void;
  };
}