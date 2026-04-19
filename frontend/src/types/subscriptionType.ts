interface SubscriptionApplicationDTO {
  projectId: number;
  userId: number;
  subscriptionAmount: number;
  tokenId: number;
  shId?: number;
  subscriptionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  paymentStatus?: 'RESERVED' | 'PAID' | 'FAILED' | 'REFUNDED';
  externalRefId?: number;
  uclId?: number; // kh증권의 wallet_id
}

interface UserInvestmentLimitDTO {
  userId: number;
  investorType: string;
  annualLimit: number;
  usedLimit: number;
  availableLimit: number;
}

type SubscriptionResultStatus = 'success' | 'api_fail' | 'empty_payload';

export type {
  SubscriptionApplicationDTO,
  SubscriptionResultStatus,
  UserInvestmentLimitDTO,
};
