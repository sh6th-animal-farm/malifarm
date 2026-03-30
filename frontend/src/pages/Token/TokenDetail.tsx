import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type {
  OrderInfo,
  Token,
  TokenOhlcv,
  TradeInfo,
} from '@/types/tokenType';
import { tokenApi } from '@/api/tokenApi';
import TokenChartCard from './components/tokenDetail/TokenChartCard';
import TokenListCard from './components/tokenDetail/TokenListCard';
import TokenTradeCard from './components/tokenDetail/TokenTradeCard';
import TokenPriceCard from './components/tokenDetail/TokenPriceCard';

export default function TokenDetail() {
  const { id } = useParams(); // URL 파라미터에서 토큰 ID 추출
  const [tokenOhlcv, setTokenOhlcv] = useState<TokenOhlcv | null>(null);
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [buyList, setBuyList] = useState<OrderInfo[]>([]);
  const [sellList, setSellList] = useState<OrderInfo[]>([]);
  const [tradeList, setTradeList] = useState<TradeInfo[]>([]);
  const navigate = useNavigate();
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  useEffect(() => {
    setSelectedPrice(null);
  }, [id]);

  // 1. 토큰 목록 조회 (마운트 시 1회)
  useEffect(() => {
    tokenApi.getTokenList().then(setTokenList);
  }, []);

  // 2. 토큰 정보 조회 (토큰 id가 바뀔 때마다)
  const fetchTokenData = async () => {
    if (!id) return;

    const tokenId = Number(id);
    const [ohlcvRes, buyRes, sellRes, tradeRes] = await Promise.all([
      tokenApi.getOhlcv(tokenId),
      tokenApi.getBuyList(tokenId),
      tokenApi.getSellList(tokenId),
      tokenApi.getTradeList(tokenId),
    ]);

    setTokenOhlcv(ohlcvRes);
    setBuyList(buyRes);
    setSellList(sellRes);
    setTradeList(tradeRes);
  };

  useEffect(() => {
    fetchTokenData();
  }, [id]);

  // 3. 클릭 시 페이지 이동
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
