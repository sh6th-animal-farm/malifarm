export interface WalletInfoDTO {
  accountNo: string;
  bankName: string;
  availableBalance: number | string;
  cashBalance: number | string;
  frozenAmount: number | string;
  totalPurchasedValue: number | string;
  totalMarketValue: number | string;
  totalBalance: number | string;
  profitLoss: number | string;
  profitLossRate: number | string;
}

export interface HoldingDTO {
  tokenName: string;
  tickerSymbol: string;
  tokenBalance: number | string;
  purchasedValue: number | string;
  marketValue: number | string;
  profitLoss: number | string;
  profitLossRate: number | string;
}

export interface MyTransactionHistDTO {
  transactionId: number;
  createdAt: string;
  transactionType:
    | "BUY"
    | "SELL"
    | "PASS"
    | "FAIL"
    | "CANCELLED"
    | "DIVIDEND"
    | "BURN"
    | string;
  tokenName: string | null;
  tickerSymbol: string | null;
  executedPrice: number | string | null;
  executedVolume: number | string | null;
  executedAmount: number | string | null;
  balanceAfter: number | string | null;
}

export interface CarbonHistoryDTO {
  cpType: string;
  projectName: string;
  dateStr: string;
  endDateStr: string;
  amount: number | string;
  price: number | string;
}

export interface ProfileDTO {
  userName: string;
  investorType: string;
  createdAt: string;
  email: string;
  phoneNumber: string;
  address: string;
  pushYn: boolean;
  receiveEmailYn: boolean;
}

export interface ProfileUpdateRequestDTO {
  address: string;
  pushYn: boolean;
  receiveEmailYn: boolean;
}

export interface PasswordUpdateRequestDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ProjectTabsDTO {
  joinedCount: number;
  starredCount: number;
}

export interface PagedResponseDTO<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
}

export interface MyPageProjectDTO {
  projectId: number;
  projectName: string;
  projectStatus: string;
  subscriptionStatus?: string | null;
  starred?: boolean | null;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
  periodText?: string | null;
  statusText1?: string | null;
  statusText2?: string | null;
}
