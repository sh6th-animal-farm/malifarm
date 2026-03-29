import type {
  CandleStick,
  Order,
  Token,
  TokenOhlcv,
  TokenPendingItem,
} from '@/types/tokenType';
import apiClient from '@/api/apiClient';

export const tokenApi = {
  getTokenInfo: (tokenId: number) =>
    apiClient.get<Token>(`/api/token/${tokenId}`),
  getTokenList: () => apiClient.get<Token[]>('/api/home/token'),
  getOhlcv: (tokenId: number) =>
    apiClient.get<TokenOhlcv>(`/api/token/ohlcv/${tokenId}`),
  getCandles: (tokenId: number, unit: number = 1) =>
    apiClient.get<CandleStick[]>(`/api/market/candles/${tokenId}?unit=${unit}`),
  getCashBalance: () => apiClient.get<string>('/api/account/balance'),
  getTokenBalance: (tokenId: number) =>
    apiClient.get<string>(`/api/account/balance/${tokenId}`),
  createOrder: (tokenId: number, order: Order) =>
    apiClient.post<Order>(`/api/token/order/${tokenId}`, order),
  cancelOrder: (tokenId: number, orderId: number) =>
    apiClient.post<void>(`/api/token/order-cancel/${tokenId}/${orderId}`),
  getPendingList: (tokenId: number) =>
    apiClient.get<TokenPendingItem[]>(`/api/token/pending/${tokenId}`),
};
