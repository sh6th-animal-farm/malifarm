import { useEffect, useState } from 'react';
import TabMenu from '@/components/common/TabMenu';
import MobileTokenListTable from './MobileTokenListTable';
import MobileTokenChartCard from './MobileTokenChartCard';
import MobileTokenPriceCard from './MobileTokenPriceCard';
import MobileTokenExecutionCard from './MobileTokenExecutionCard';
import MobileTokenTradeCard from './MobileTokenTradeCard';
import type { OrderInfo, Token, TokenOhlcv, TradeInfo } from '@/types/tokenType';

const MOBILE_TOKEN_DETAIL_TAB_KEY = 'mobile-token-detail-tab';

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
  initialTab,
}: TokenDetailMobileProps) {
  const [mobileTab, setMobileTab] = useState(() => {
    if (typeof window === 'undefined') return initialTab || 'chart';
    const saved = sessionStorage.getItem(MOBILE_TOKEN_DETAIL_TAB_KEY);
    return saved || initialTab || 'chart';
  });
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(tokenId);

  useEffect(() => {
    setSelectedTokenId(tokenId);
  }, [tokenId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!initialTab) return;
    setMobileTab(initialTab);
    sessionStorage.setItem(MOBILE_TOKEN_DETAIL_TAB_KEY, initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(MOBILE_TOKEN_DETAIL_TAB_KEY, mobileTab);
  }, [mobileTab]);

  const mobileTabs = [
    { text: '목록', value: 'list' },
    { text: '차트', value: 'chart' },
    { text: '호가', value: 'price' },
    { text: '체결', value: 'execution' },
    { text: '거래', value: 'trade' },
  ];

  return (
    <div className="md:hidden flex h-[var(--custom-calc-height)] flex-col overflow-hidden">
      <div className="bg-white">
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

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
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
            selectedTokenId={selectedTokenId}
            onSelect={setSelectedTokenId}
            onRowClick={() => setMobileTab('chart')}
          />
        )}

        {mobileTab === 'price' &&
          (buyList && sellList ? (
            <MobileTokenPriceCard
              ohlcv={tokenOhlcv}
              buyList={buyList}
              sellList={sellList}
              onPriceClick={onPriceSelect}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50">
              호가 데이터를 불러오는 중입니다.
            </div>
          ))}

        {mobileTab === 'execution' && (
          <MobileTokenExecutionCard tradeList={tradeList} />
        )}

        {mobileTab === 'trade' && (
          <MobileTokenTradeCard
            tokenId={tokenId}
            marketPrice={tradePrice}
            tickerSymbol={tokenOhlcv?.tickerSymbol || '-'}
            ohlcv={tokenOhlcv}
            buyList={buyList}
            sellList={sellList}
          />
        )}
      </div>
    </div>
  );
}
