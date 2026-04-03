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
  getWalletInfo: () =>
    apiClient.get<WalletInfoDTO, WalletInfoDTO>('/api/mypage/wallet-info'),

  getHoldings: (page = 1) =>
    apiClient.get<HoldingDTO[], HoldingDTO[]>(
      `/api/mypage/holdings?page=${page}`,
    ),

  // 계좌 연동
  linkAccount: () => apiClient.get<number, number>('/api/mypage/account/link'),

  // 계좌 생성 및 연동
  createAndLinkAccount: () =>
    apiClient.get<number, number>('/api/mypage/account/create-link'),

  // 거래 내역
  getTransactionHistory: ({
    page = 1,
    period = 0,
    category,
  }: {
    page?: number;
    period?: number;
    category?: string;
  }) =>
    apiClient.get<MyTransactionHistDTO[], MyTransactionHistDTO[]>(
      `/api/mypage/transaction-history?page=${page}&period=${period}${category ? `&category=${category}` : ''}`,
    ),

  // 나의 프로젝트
  getProjectTabs: () =>
    apiClient.get<ProjectTabsDTO, ProjectTabsDTO>('/api/mypage/projects/tabs'),

  getProjects: ({
    type = 'JOIN',
    status = 'ALL',
    page = 1,
    size = 10,
  }: {
    type?: 'JOIN' | 'STAR';
    status?: 'ALL' | 'SUBSCRIPTION' | 'ANNOUNCEMENT' | 'ENDED';
    page?: number;
    size?: number;
  }) =>
    apiClient.get<
      PagedResponseDTO<MyPageProjectDTO>,
      PagedResponseDTO<MyPageProjectDTO>
    >(
      `/api/mypage/projects?type=${type}&status=${status}&page=${page}&size=${size}`,
    ),

  // 탄소 배출권 구매 내역
  getCarbonHistory: () =>
    apiClient.get<CarbonHistoryDTO[], CarbonHistoryDTO[]>(
      '/api/mypage/carbon-history',
    ),

  // 내 정보
  getProfile: () =>
    apiClient.get<ProfileDTO, ProfileDTO>('/api/mypage/profile'),

  updateProfile: (payload: ProfileUpdateRequestDTO) =>
    apiClient.patch<null, null>('/api/mypage/profile', payload),

  updatePassword: (payload: PasswordUpdateRequestDTO) =>
    apiClient.patch<null, null>('/api/mypage/password', payload),
};
