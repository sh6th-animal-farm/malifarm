import type { SubscriptionApplicationDTO } from '@/types/subscriptionType';
import apiClient from './apiClient';

export const subscriptionApi = {
  applySubscription: (data: SubscriptionApplicationDTO): Promise<string> => {
    return apiClient.post(`/api/subscription/application`, data);
  },
  cancelSubscription: (projectId: number): Promise<void> => {
    return apiClient.post('/api/subscription/cancel', projectId);
  },
  checkStatus: (
    projectId: number,
  ): Promise<{ isApplied?: boolean; data?: { isApplied?: boolean } }> => {
    return apiClient.get(`/api/subscription/check/${projectId}`);
  },
};
