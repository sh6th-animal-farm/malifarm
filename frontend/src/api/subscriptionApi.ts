import type { SubscriptionApplicationDTO } from '@/types/subscriptionType';
import apiClient from './apiClient';

export const subscriptionApi = {
  applySubscription: (data: SubscriptionApplicationDTO) => {
    return apiClient.post<string>(`/api/subscription/application`, data);
  },
  cancelSubscription: (projectId: number) => {
    return apiClient.post('/api/subscription/cancel', projectId);
  },
  checkStatus: (projectId: number) => {
    return apiClient.get(`/api/subscription/check/${projectId}`);
  },
};
