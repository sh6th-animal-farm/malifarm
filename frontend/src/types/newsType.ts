export interface MarketNewsDTO {
  newsId: number;
  tokenId: number | null;
  title: string;
  summaryShort: string;
  summaryText: string;
  newsType: "GLOBAL" | "TOKEN";
  createdAt: string;
  avgChangeRate: number | null;
  adrValue: number | null;
  volGrowthRate: number | null;
  highlightTokens: string | null;
}

export interface NewsListItem {
  id: number;
  hourLabel: string;
  source: string;
  title: string;
  summary: string;
  publishedAt: string;
}
