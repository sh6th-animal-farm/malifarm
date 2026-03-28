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

// 토큰 거래소 요약 차트
export interface TokenSummaryInfo {
  tickerSymbol: string; // 토큰 코드
  tokenName: string; // 토큰 이름
  marketPrice: number; // 현재가
  changeRate: number; // 등락률
  openPrice: number; // 시가
  highPrice: number; // 고가
  lowPrice: number; // 저가
  dailyTradeVolume: number; // 거래대금
}