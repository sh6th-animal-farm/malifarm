import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { TokenListItem, TokenOhlcv } from '@/types/tokenType';
import { tokenApi } from '@/api/tokenApi';
import TokenTradeCard from './components/TokenTradeCard';
import TokenChartCard from './components/TokenChartCard';
import TokenListCard from './components/TokenListCard';

export default function TokenDetail() {
  const { id } = useParams(); // URL 파라미터에서 토큰 ID 추출
  const [tokenOhlcv, setTokenOhlcv] = useState<TokenOhlcv | null>(null);
  const [tokenList, setTokenList] = useState<TokenListItem[]>([]);
  const navigate = useNavigate();

  // 1. 토큰 목록 조회 (마운트 시 1회)
  useEffect(() => {
    tokenApi.getTokenList().then(setTokenList);
  }, []);

  // 2. 토큰 Ohlcv 정보 조회 (토큰 id가 바뀔 때마다)
  useEffect(() => {
    if (!id) return;
    tokenApi.getOhlcv(Number(id)).then(setTokenOhlcv);
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
          <TokenTradeCard tokenId={Number(id)} />
        </div>
      </div>
    </div>
  );
}
