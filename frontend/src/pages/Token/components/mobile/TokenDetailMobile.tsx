import { useEffect, useState } from 'react';
import TabMenu from '@/components/common/TabMenu';
import MobileTokenListTable from './MobileTokenListTable';
import MobileTokenChartCard from './MobileTokenChartCard';
import MobileTokenPriceCard from './MobileTokenPriceCard';
import MobileTokenTradeCard from './MobileTokenTradeCard';
import type { OrderInfo, Token, TokenOhlcv, TradeInfo } from '@/types/tokenType';

interface TokenDetailMobileProps {
  tokenId: number;
  tokenList: Token[];
  tokenOhlcv: TokenOhlcv | null;
  buyList: OrderInfo[];
  sellList: OrderInfo[];
  tradeList: TradeInfo[];
  tradePrice: number;
  onPriceSelect: (price: number) => void;
  initialTab?: string;
}

export default function TokenDetailMobile({
  tokenId,
  tokenList,
  tokenOhlcv,
  buyList,
  sellList,
  tradeList,
  tradePrice,
  onPriceSelect,
  initialTab = 'chart',
}: TokenDetailMobileProps) {
  const [mobileTab, setMobileTab] = useState(initialTab);
  const [hoveredTokenId, setHoveredTokenId] = useState<number | null>(tokenId);

  useEffect(() => {
    setHoveredTokenId(tokenId);
  }, [tokenId]);

  const mobileTabs = [
    { text: '목록', value: 'list' },
    { text: '차트', value: 'chart' },
    { text: '호가', value: 'price' },
    { text: '거래', value: 'trade' },
  ];

  return (
    <div className="md:hidden flex min-h-[calc(100dvh-52px-var(--bottom-tabbar-height))] flex-col">
      <div className="sticky top-[52px] z-20 bg-white">
        <TabMenu
          items={mobileTabs}
          currentValue={mobileTab}
          onTabChange={setMobileTab}
          tabPaddingY={8}
          gap={0}
          marginY={0}
          equalWidth
          className="px-4"
        />
      </div>

      <div className="flex-1 min-h-0">
        {mobileTab === 'chart' &&
          (tokenOhlcv ? (
            <MobileTokenChartCard tokenOhlcv={tokenOhlcv} />
          ) : (
            <div className="h-[540px] flex items-center justify-center rounded-lg bg-gray-50">
              차트 데이터를 불러오는 중입니다.
            </div>
          ))}

        {mobileTab === 'list' && (
          <MobileTokenListTable
            tokenList={tokenList}
            hoveredTokenId={hoveredTokenId}
            onHover={setHoveredTokenId}
          />
        )}

        {mobileTab === 'price' &&
          (buyList && sellList ? (
            <MobileTokenPriceCard
              ohlcv={tokenOhlcv}
              buyList={buyList}
              sellList={sellList}
              tradeList={tradeList}
              onPriceClick={onPriceSelect}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50">
              호가 데이터를 불러오는 중입니다.
            </div>
          ))}

        {mobileTab === 'trade' && (
          <MobileTokenTradeCard
            tokenId={tokenId}
            marketPrice={tradePrice}
            tickerSymbol={tokenOhlcv?.tickerSymbol || '-'}
          />
        )}
      </div>
    </div>
  );
}
