import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TokenChartCard from './components/tokenDetail/TokenChartCard';
import TokenListCard from './components/tokenDetail/TokenListCard';
import TokenTradeCard from './components/tokenDetail/TokenTradeCard';
import TokenPriceCard from './components/tokenDetail/TokenPriceCard';
import { useOrderbook } from '@/hooks/useOrderbook.ts';
import { useTradeHistory } from '@/hooks/useTradeHistory.ts';
import { useTokenList } from '@/hooks/useTokenList';
import { useTokenOhlcv } from '@/hooks/useTokenOhlcv';

export default function TokenDetail() {
  const { id } = useParams(); // URL 파라미터에서 토큰 ID 추출
  const navigate = useNavigate();
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  // 훅을 통한 데이터 관리
  const { tokenList } = useTokenList(); // 토큰 목록
  const { tokenOhlcv } = useTokenOhlcv(id); // 토큰 OHLCV
  const { buyList, sellList } = useOrderbook(id); // 호가 (매수, 매도)
  const { trades: tradeList } = useTradeHistory(id); // 체결

  // id가 변경될 때마다 선택된 가격 초기화
  useEffect(() => {
    setSelectedPrice(null);
  }, [id]);

  // 클릭 시 페이지 이동
  const handleTokenClick = (tokenId: number) => {
    navigate(`/token/${tokenId}`);
  };

  return (
    <div className="container">
      <div className="flex gap-6 items-start w-full">
        <div className="flex-[2] min-w-0 flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            {tokenOhlcv ? (
              <TokenChartCard tokenOhlcv={tokenOhlcv} />
            ) : (
              <div className="h-[540px] flex items-center justify-center bg-gray-50">
                차트 데이터를 불러오는 중입니다.
              </div>
            )}
            <TokenListCard
              tokenList={tokenList}
              activeTokenId={Number(id)}
              onTokenClick={handleTokenClick}
            />
          </div>
        </div>
        <div className="flex-1 min-w-[416px] flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <TokenTradeCard
              tokenId={Number(id)}
              marketPrice={selectedPrice || tokenOhlcv?.marketPrice || 0}
              tickerSymbol={tokenOhlcv?.tickerSymbol || '-'}
            />
            <TokenPriceCard
              ohlcv={tokenOhlcv}
              buyList={buyList}
              sellList={sellList}
              tradeList={tradeList}
              onPriceClick={(price) => setSelectedPrice(price)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
