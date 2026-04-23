import apiClient from './apiClient';
import type {
  CarbonHistoryDTO,
  HoldingDTO,
  MyPageProjectDTO,
  MyTransactionHistDTO,
  PasswordUpdateRequestDTO,
  PagedResponseDTO,
  ProfileDTO,
  ProfileUpdateRequestDTO,
  ProjectTabsDTO,
  WalletInfoDTO,
} from '@/types/myPageType';

export const myPageApi = {
  // 나의 전자 지갑
  getWalletInfo: (): Promise<WalletInfoDTO> =>
    apiClient.get('/api/mypage/wallet-info'),

  getHoldings: (page = 1): Promise<HoldingDTO[]> =>
    apiClient.get(`/api/mypage/holdings?page=${page}`),

  // 계좌 연동
  linkAccount: (): Promise<number> => apiClient.get('/api/mypage/account/link'),

  // 계좌 생성 및 연동
  createAndLinkAccount: (): Promise<number> =>
    apiClient.get('/api/mypage/account/create-link'),
  // 거래 내역
  getTransactionHistory: ({
    page = 1,
    period = 0,
    category,
  }: {
    page?: number;
    period?: number;
    category?: string;
  }): Promise<MyTransactionHistDTO[]> =>
    apiClient.get(
      `/api/mypage/transaction-history?page=${page}&period=${period}${category ? `&category=${category}` : ''}`,
    ),

  // 나의 프로젝트
  getProjectTabs: (): Promise<ProjectTabsDTO> =>
    apiClient.get('/api/mypage/projects/tabs'),

  getProjects: ({
    type = 'JOIN',
    status = 'ALL',
    page = 1,
    size = 10,
  }: {
    type?: 'JOIN' | 'STAR';
    status?:
      | 'ALL'
      | 'SUBSCRIPTION'
      | 'ANNOUNCEMENT'
      | 'INPROGRESS'
      | 'COMPLETED'
      | 'CANCELED';
    page?: number;
    size?: number;
  }): Promise<PagedResponseDTO<MyPageProjectDTO>> =>
    apiClient.get(
      `/api/mypage/projects?type=${type}&status=${status}&page=${page}&size=${size}`,
    ),

  // 탄소 배출권 구매 내역
  getCarbonHistory: (): Promise<CarbonHistoryDTO[]> =>
    apiClient.get('/api/mypage/carbon-history'),

  // 내 정보
  getProfile: (): Promise<ProfileDTO> => apiClient.get('/api/mypage/profile'),

  updateProfile: (payload: ProfileUpdateRequestDTO): Promise<null> =>
    apiClient.patch('/api/mypage/profile', payload),

  updatePassword: (payload: PasswordUpdateRequestDTO): Promise<null> =>
    apiClient.patch('/api/mypage/password', payload),
};
