import type {
  Project,
  ProjectData,
  ProjectList,
  Wallet,
} from '@/types/projectType';
import apiClient from './apiClient';
import type { FarmDTO } from '@/types/farmType';

export interface DividendPollData {
  dividendId: number;
  userId: number;
  projectId: number;
  amountAftTax: number | string;
  dividendType: 'CASH' | 'CROP' | string;
  status: string;
  pollEndDate: string;
  selectionAt?: string | null;
}

export interface DividendPollResponse {
  dividend: DividendPollData;
}

export const projectApi = {
  getProjectDetail: (projectId: string | number): Promise<ProjectData> => {
    return apiClient.get(`/api/project/${projectId}`);
  },
  getCheckAccount: (
    userId: string | number | undefined,
  ): Promise<boolean> => {
    return apiClient.get(`/api/project/checkAccount`, {
      params: { userId },
    });
  },
  getMyWalletInfo: (
    userId: string | number | undefined,
  ): Promise<Wallet> => {
    return apiClient.get(`/api/project/walletInfo`, {
      params: { userId },
    });
  },
  getAllProjects: (): Promise<Project[]> => {
    return apiClient.get(`/api/project/all`);
  },
  getStarredStatus: (projectId: number): Promise<boolean> => {
    return apiClient.get(`/api/project/starred`, {
      params: { projectId },
    });
  },
  toggleStar: (projectId: number): Promise<boolean> => {
    return apiClient.post(`/api/project/starred`, projectId, {});
  },
  getAllFarms: (): Promise<FarmDTO[]> => {
    return apiClient.get(`/api/project/farm/all`);
  },
  getProjectsByCondition: (params: {
    projectStatus?: string;
    keyword?: string;
    userId?: number | null;
  }): Promise<ProjectList[]> => {
    return apiClient.get(`/api/project/list`, {
      params: params,
    });
  },
  getDividendPollData: (
    dividendId: number | string,
  ): Promise<DividendPollResponse> => {
    return apiClient.get(`/api/project/dividend/poll-data`, {
      params: { id: dividendId },
    });
  },
  selectDividendPoll: (payload: {
    dividendId: number;
    dividendType: 'CASH' | 'CROP';
    address?: string;
  }): Promise<boolean> => {
    return apiClient.post(
      `/api/project/dividend/poll/select`,
      payload,
    );
  },
};
