import TokenTradeCard from '../tokenDetail/TokenTradeCard';

interface MobileTokenTradeCardProps {
  tokenId: number;
  marketPrice: number;
  tickerSymbol: string;
}

export default function MobileTokenTradeCard({
  tokenId,
  marketPrice,
  tickerSymbol,
}: MobileTokenTradeCardProps) {
  return (
    <TokenTradeCard
      tokenId={tokenId}
      marketPrice={marketPrice}
      tickerSymbol={tickerSymbol}
    />
  );
}
