import apiClient from './apiClient'; // 기존 http_client 재사용 (apiClient.ts로 가정)
import axios from 'axios';

export interface FarmData {
  farmName: string;
  farmType: string;
  area: number;
  openAt: string;
  addressSido: string;
  addressSigungu: string;
  addressStreet: string;
  latitude: number;
  longitude: number;
  altitude: number;
  description?: string;
}

export interface ProjectData {
  projectId?: number;
  farmId: number;
  projectName: string;
  projectRound: number;
  projectDescription?: string;
  targetAmount: number;
  minAmountPerInvestor: number;
  expectedReturn: number;
  managerCount: number;
  announcementStartDate: string;
  announcementEndDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  resultAnnouncementDate: string;
  projectStartDate: string;
  projectEndDate: string;
  projectImages?: File[];
  deletedPictureIds?: number[];
}

export interface CultivationData {
  projectId: number;
  managerCount: number;
  crop: string;
  expectedYield: number;
  actualYield?: number;
  plantingDate: string;
  harvestDate?: string;
  notes?: string;
}

export interface ExpenseData {
  projectId: number;
  recordedBy: string;
  category: string;
  subCategory: string;
  amount: number;
  startDate: string;
  endDate: string;
  vendor: string;
  description?: string;
}

export interface RevenueData {
  projectId: number;
  recordedBy: string;
  startDate: string;
  endDate: string;
  amount: number;
  description?: string;
}

export const adminApi = {
  insertFarm: (data: FarmData) => apiClient.post('/farm/insert', data),
  getCoords: (address: string) =>
    apiClient.get(`/farm/get-coords?address=${encodeURIComponent(address)}`),
  getFarms: async () => {
    // /api/project/farm/all은 ApiResponseDTO 없이 직접 배열을 반환하므로 axios 직접 사용
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${baseURL}/api/project/farm/all`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data;
  },
  insertProject: (data: FormData) =>
    apiClient.post('/api/project/insert', data),
  updateProject: (data: FormData) =>
    apiClient.post('/api/project/update', data),
  getProjects: () => apiClient.get('/api/project/all'),
  getProjectDetails: (projectId: number) =>
    apiClient.get(`/api/project/${projectId}`),
  getProjectPictures: (projectId: number) =>
    apiClient.get(`/api/project/${projectId}/pictures`),
  getTokens: (projectId: number) =>
    apiClient.get(`/api/token/${projectId}`),
  insertCultivation: (data: CultivationData) =>
    apiClient.post('/api/cultivation/insert', data),
  insertExpense: (data: ExpenseData) =>
    apiClient.post('/api/expense/insert', data),
  insertRevenue: (data: RevenueData) =>
    apiClient.post('/api/revenue/insert', data),
};
