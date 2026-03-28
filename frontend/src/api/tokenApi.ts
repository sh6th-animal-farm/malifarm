import type { Token, TokenSummaryInfo } from "../types/tokenType";
import apiClient from "./apiClient";

export const tokenApi = {
    getTokenInfo: (tokenId: number) => apiClient.get<Token>(`/api/token/${tokenId}`),
    getTokenList: () => apiClient.get<Token[]>("/api/home/token"),
    getOhlcv: (tokenId: number) => apiClient.get<TokenSummaryInfo>(`/api/token/ohlcv/${tokenId}`),
    getCandles: (tokenId: number, unit: number = 1) => apiClient.get(`/api/market/candles/${tokenId}?unit=${unit}`),
}