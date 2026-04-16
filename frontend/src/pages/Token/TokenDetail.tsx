import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import TokenChartCard from './components/tokenDetail/TokenChartCard';
import TokenListCard from './components/tokenDetail/TokenListCard';
import TokenTradeCard from './components/tokenDetail/TokenTradeCard';
import TokenPriceCard from './components/tokenDetail/TokenPriceCard';
import TokenDetailMobile from './components/mobile/TokenDetailMobile';
import { useOrderbook } from '@/pages/Token/hooks/useOrderbook';
import { useTradeHistory } from '@/pages/Token/hooks/useTradeHistory';
import { useTokenList } from '@/pages/Token/hooks/useTokenList';
import { useTokenOhlcv } from '@/pages/Token/hooks/useTokenOhlcv';

export default function TokenDetail() {
  const { id } = useParams(); // URL 파라미터에서 토큰 ID 추출
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false,
  );
  const isFixed = useRef(false); // 가격이 고정되었는지 저장
  const [fixedPrice, setFixedPrice] = useState<number | null>(null); // 최초 로드 시 시장가로 세팅
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null); // 사용자가 직접 선택한 가격

  // 훅을 통한 데이터 관리 (에러 방지를 위해 기본값 [] 설정)
  const { tokenList = [] } = useTokenList(); // 토큰 목록
  const { tokenOhlcv } = useTokenOhlcv(id); // 토큰 OHLCV
  const { buyList = [], sellList = [] } = useOrderbook(id); // 호가 (매수, 매도)
  const { trades: tradeList = [] } = useTradeHistory(id); // 체결

  // id가 변경될 때마다 가격 초기화
  useEffect(() => {
    setFixedPrice(null);
    setSelectedPrice(null);
    isFixed.current = false;
  }, [id]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 최초 1회만 marketPrice를 fixedPrice에 저장
  useEffect(() => {
    if (isFixed.current) return;

    if (tokenOhlcv?.marketPrice && fixedPrice === null) {
      setFixedPrice(tokenOhlcv.marketPrice);
      isFixed.current = true;
    }
  }, [tokenOhlcv?.marketPrice]);

  // 클릭 시 페이지 이동
  const handleTokenClick = (tokenId: number) => {
    navigate(`/token/${tokenId}`);
  };

  return (
    <>
      {isMobile && (
        <TokenDetailMobile
          tokenId={Number(id)}
          tokenList={tokenList}
          tokenOhlcv={tokenOhlcv}
          buyList={buyList}
          sellList={sellList}
          tradePrice={selectedPrice ?? fixedPrice ?? 0}
          onPriceSelect={setSelectedPrice}
          initialTab={location.state?.mobileTab === 'list' ? 'list' : 'chart'}
        />
      )}

      {!isMobile && (
        <div className="layout-container py-0 md:py-20">
          <div className="flex flex-col gap-2 md:gap-6">
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
                    marketPrice={selectedPrice ?? fixedPrice ?? 0} // 우선순위: 선택한 가격 > 최초 고정 가격 > 0
                    tickerSymbol={tokenOhlcv?.tickerSymbol || '-'}
                  />
                  {buyList && sellList ? (
                    <TokenPriceCard
                      ohlcv={tokenOhlcv}
                      buyList={buyList}
                      sellList={sellList}
                      tradeList={tradeList}
                      onPriceClick={(price) => setSelectedPrice(price)}
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center bg-gray-50">
                      호가 데이터를 불러오는 중입니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
