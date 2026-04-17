// src/api/carbonApi.ts
import apiClient from './apiClient';
import type {
  CarbonListDTO,
  CarbonDetailDTO,
  CarbonOrderQuote,
} from '../types/carbonType';

export const carbonApi = {
  // 알맹이 타입(CarbonListDTO[])만 바로 리턴한다고 명시합니다.
  getCarbonList: (category: string = 'ALL') => {
    return apiClient.get<unknown, CarbonListDTO[]>(
      `/api/carbon/category?category=${category}`,
    );
  },

  getCarbonDetail: (cpId: number) => {
    return apiClient.get<unknown, CarbonDetailDTO>(`/api/carbon/${cpId}`);
  },

  getCarbonQuote: (cpId: number, amount: number) => {
    return apiClient.get<unknown, CarbonOrderQuote>(
      `/api/carbon/orders/quote?cpId=${cpId}&amount=${amount}`,
    );
  },

  completeOrder: (data: {
    impUid: string;
    merchantUid: string;
    cpId: number;
    amount: number;
  }) => {
    return apiClient.post<unknown, string>(`/api/carbon/orders/complete`, data);
  },
};
