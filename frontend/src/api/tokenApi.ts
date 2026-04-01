import type {
  CandleStick,
  Order,
  OrderInfo,
  Token,
  TokenOhlcv,
  TokenPending,
  TradeInfo,
} from '@/types/tokenType';
import apiClient from '@/api/apiClient';

export const tokenApi = {
  getTokenInfo: (tokenId: number) =>
    apiClient.get<Token>(`/api/token/${tokenId}`),
  getTokenList: () => apiClient.get<Token[]>('/api/token'),
  getOhlcv: (tokenId: number) =>
    apiClient.get<TokenOhlcv>(`/api/token/ohlcv/${tokenId}`),
  getCandles: (tokenId: number, unit: number = 1) =>
    apiClient.get<CandleStick[]>(`/api/market/candles/${tokenId}?unit=${unit}`),
  getCashBalance: () => apiClient.get<number>('/api/account/balance'),
  getTokenBalance: (tokenId: number) =>
    apiClient.get<number>(`/api/account/balance/${tokenId}`),
  createOrder: (tokenId: number, order: Order) =>
    apiClient.post<Order>(`/api/token/order/${tokenId}`, order),
  cancelOrder: (tokenId: number, orderId: number) =>
    apiClient.post<void>(`/api/token/order-cancel/${tokenId}/${orderId}`),
  getPendingList: (tokenId: number) =>
    apiClient.get<TokenPending[]>(`/api/token/pending/${tokenId}`),
  getBuyList: (tokenId: number) =>
    apiClient.get<OrderInfo[]>(`/api/token/buy/${tokenId}`),
  getSellList: (tokenId: number) =>
    apiClient.get<OrderInfo[]>(`/api/token/sell/${tokenId}`),
  getTradeList: (tokenId: number) =>
    apiClient.get<TradeInfo[]>(`/api/token/trade/${tokenId}`),
};
