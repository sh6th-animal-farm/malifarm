import type { Project, ProjectData, ProjectList } from '@/types/projectType';
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
  getProjectDetail: (projectId: string | number) => {
    return apiClient.get<ProjectData>(`/api/project/${projectId}`);
  },
  getCheckAccount: (userId: string | number | undefined) => {
    return apiClient.get(`/api/project/checkAccount`, {
      params: { userId },
    });
  },
  getMyWalletInfo: (userId: string | number | undefined) => {
    return apiClient.get(`/api/project/walletInfo`, {
      params: { userId },
    });
  },
  getAllProjects: () => {
    return apiClient.get<Project[]>(`/api/project/all`);
  },
  getStarredStatus: (projectId: number) => {
    return apiClient.get(`/api/project/starred`, {
      params: { projectId },
    });
  },
  toggleStar: (projectId: number) => {
    return apiClient.post(`/api/project/starred`, projectId, {});
  },
  getAllFarms: () => {
    return apiClient.get<FarmDTO[]>(`/api/project/farm/all`);
  },
  getProjectsByCondition: async (params: {
    projectStatus?: string;
    keyword?: string;
    userId?: number | null;
  }) => {
    const response = await apiClient.get<ProjectList[]>(`/api/project/list`, {
      params: params,
    });
    return response;
  },
  getDividendPollData: async (dividendId: number | string) => {
    const response = (await apiClient.get(`/api/project/dividend/poll-data`, {
      params: { id: dividendId },
    })) as DividendPollResponse;
    return response;
  },
  selectDividendPoll: async (payload: {
    dividendId: number;
    dividendType: 'CASH' | 'CROP';
    address?: string;
  }) => {
    const response = (await apiClient.post(
      `/api/project/dividend/poll/select`,
      payload,
    )) as boolean;
    return response;
  },
};
