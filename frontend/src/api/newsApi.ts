import type { MarketNewsDTO } from "@/types/newsType";
import apiClient from "./apiClient";

export const newsApi = {
  getGlobalList: (): Promise<MarketNewsDTO[]> => {
    return apiClient.get<MarketNewsDTO[], MarketNewsDTO[]>(`/api/news/global/list`);
  },
  getGlobalDetail: (newsId: number): Promise<MarketNewsDTO> => {
    return apiClient.get<MarketNewsDTO, MarketNewsDTO>(`/api/news/global/${newsId}`);
  },
};
