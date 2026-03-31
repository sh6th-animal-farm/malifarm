import type { Project, ProjectData, ProjectList } from '@/types/projectType';
import apiClient from './apiClient';
import type { FarmDTO } from '@/types/farmType';

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
    return apiClient.post(`/api/project/starred`, projectId, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  getAllFarms: () => {
    // 컨트롤러의 RequestMapping 경로에 따라 수정이 필요할 수 있습니다.
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
};
