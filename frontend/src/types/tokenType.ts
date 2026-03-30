/* 1. 메인 페이지 */
// 토큰 거래소 TOP10
export interface TokenShort {
  tokenId: number;
  tokenName: string;
  marketPrice: number;
  changeRate: number;
}

/* 2. 토큰 거래소 목록 페이지 */
// 목록
export interface Token {
  tokenId: number;
  tokenName: string;
  tickerSymbol: string;
  marketPrice: number;
  dailyTradeVolume: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  changeRate: number;
}

// 토큰 Ohlcv 정보
export interface TokenOhlcv {
  tokenId: number;
  tokenName: string;
  tickerSymbol: string;
  marketPrice: number;
  dailyTradeVolume: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  changeRate: number;
}

// 캔들 정보
export interface CandleStick {
  tokenId: number;
  unit: number;
  candleTime: string;
  openingPrice: string;
  highPrice: string;
  lowPrice: string;
  closingPrice: string;
  tradeVolume: string;
  tradeAmount: string;
}

/* 3. 토큰 거래소 상세 페이지 */
// 미체결 내역
export interface TokenPending {
  orderId: number;
  orderSide: 'BUY' | 'SELL';
  orderPrice: string;
  orderVolume: string;
  remainingToken: string;
  createdAt: string;
}

// 주문
export interface Order {
  walletId?: number;
  tokenId: number;
  orderSide: 'BUY' | 'SELL';
  orderType: 'LIMIT' | 'MARKET';
  orderPrice: string; // 시장가는 "0"
  orderVolume: string; // 시장가 매수는 "0"
  totalPrice: string; // 매도는 "0"
}

// 호가 정보
export interface OrderInfo {
  price: string;
  totalVolume: string;
  side: 'BUY' | 'SELL';
}

// 체결 정보
export interface TradeInfo {
  price: string;
  volume: string;
  takerSide: 'BUY' | 'SELL';
  createdAt: string;
}

// 웹소켓 호가 정보
export interface LiveOrderInfo {
  price: string,
  updatedVolume: string,
  side: 'BUY' | 'SELL',
  action: 'UPDATE' | 'DELETE'
}
