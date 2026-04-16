import TokenPriceCard from '../tokenDetail/TokenPriceCard';
import type { OrderInfo, TokenOhlcv, TradeInfo } from '@/types/tokenType';

interface MobileTokenPriceCardProps {
  ohlcv: TokenOhlcv | null;
  buyList: OrderInfo[];
  sellList: OrderInfo[];
  tradeList: TradeInfo[];
  onPriceClick: (price: number) => void;
}

export default function MobileTokenPriceCard({
  ohlcv,
  buyList,
  sellList,
  tradeList,
  onPriceClick,
}: MobileTokenPriceCardProps) {
  return (
    <TokenPriceCard
      ohlcv={ohlcv}
      buyList={buyList}
      sellList={sellList}
      tradeList={tradeList}
      onPriceClick={onPriceClick}
    />
  );
}
