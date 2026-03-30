import type { Project, ProjectData } from '@/types/projectType';
import apiClient from './apiClient';

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
      params: { projectId }, // @RequestParam Long projectId 대응
    });
  },
  toggleStar: (projectId: number) => {
    // 백엔드 @RequestBody Long projectId 대응
    // 두 번째 인자로 데이터(projectId)를 보내고, 숫자를 그대로 보내기 위해 타입을 명시합니다.
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
};
