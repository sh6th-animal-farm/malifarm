import type { MarketNewsDTO } from "@/types/newsType";
import apiClient from "./apiClient";

export const newsApi = {
  getGlobalList: () => {
    return apiClient.get<MarketNewsDTO[]>(`/api/news/global/list`);
  },
  getGlobalDetail: (newsId: number) => {
    return apiClient.get<MarketNewsDTO>(`/api/news/global/${newsId}`);
  },
};
