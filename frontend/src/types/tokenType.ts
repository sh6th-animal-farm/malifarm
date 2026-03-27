// 메인페이지 토큰 거래소 TOP10
export interface Token {
  tokenId: number;
  projectId: number;
  tokenName: string;
  tickerSymbol: string;
  totalSupply: number;
}

// 토큰 거래소 목록
export interface TokenListItem {
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