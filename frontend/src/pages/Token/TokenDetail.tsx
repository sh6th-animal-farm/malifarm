import { useParams } from 'react-router-dom';
import TokenTradeCard from './components/TokenTradeCard';
import TokenChartCard from './components/TokenChartCard';
import { useEffect, useState } from 'react';
import type { TokenOhlcv } from '@/types/tokenType';
import { tokenApi } from '@/api/tokenApi';

export default function TokenDetail() {
  const { id } = useParams(); // URL 파라미터에서 토큰 ID 추출
  const [tokenOhlcv, setTokenOhlcv] = useState<TokenOhlcv | null>(null);

  useEffect(() => {
    tokenApi.getOhlcv(Number(id)).then((data) => {
      console.log(data);
      setTokenOhlcv(data);
    });
  }, [id]);

  return (
    <div className="container">
      <div className="flex gap-6 items-start w-full">
        <div className="flex-[2] min-w-0 flex flex-col gap-6">
          {tokenOhlcv ? (
            <TokenChartCard tokenOhlcv={tokenOhlcv} />
          ) : (
            <div className="h-[540px] flex items-center justify-center bg-gray-50">
              차트 데이터를 불러오는 중입니다.
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[416px] flex flex-col gap-6">
          <TokenTradeCard tokenId={Number(id)} />
        </div>
      </div>
    </div>
  );
}
