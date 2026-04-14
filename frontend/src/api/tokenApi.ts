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
  getTokenInfo: (tokenId: number): Promise<Token> => {
    return apiClient.get(`/api/token/${tokenId}`);
  },
  getTokenList: (): Promise<Token[]> => {
    return apiClient.get('/api/token');
  },
  getOhlcv: (tokenId: number): Promise<TokenOhlcv> => {
    return apiClient.get(`/api/token/ohlcv/${tokenId}`);
  },
  getCandles: (tokenId: number, unit: number = 1): Promise<CandleStick[]> => {
    return apiClient.get(`/api/market/candles/${tokenId}?unit=${unit}`);
  },
  getCashBalance: (): Promise<number> => {
    return apiClient.get('/api/account/balance');
  },
  getTokenBalance: (tokenId: number): Promise<number> => {
    return apiClient.get(`/api/account/balance/${tokenId}`);
  },
  createOrder: (tokenId: number, order: Order): Promise<Order> => {
    return apiClient.post(`/api/token/order/${tokenId}`, order);
  },
  cancelOrder: (tokenId: number, orderId: number): Promise<void> => {
    return apiClient.post(`/api/token/order-cancel/${tokenId}/${orderId}`);
  },
  getPendingList: (tokenId: number): Promise<TokenPending[]> => {
    return apiClient.get(`/api/token/pending/${tokenId}`);
  },
  getBuyList: (tokenId: number): Promise<OrderInfo[]> => {
    return apiClient.get(`/api/token/buy/${tokenId}`);
  },
  getSellList: (tokenId: number): Promise<OrderInfo[]> => {
    return apiClient.get(`/api/token/sell/${tokenId}`);
  },
  getTradeList: (tokenId: number): Promise<TradeInfo[]> => {
    return apiClient.get(`/api/token/trade/${tokenId}`);
  },
};
