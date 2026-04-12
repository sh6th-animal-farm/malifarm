import { myPageApi } from '@/api/myPageApi';
import type {
  HoldingDTO,
  MarketPriceDTO,
  WalletInfoDTO,
  WalletUpdate,
} from '@/types/myPageType';
import WebSocketManager from '@/utils/WebSocketManager';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useWalletInfo = (walletId: number | undefined) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfoDTO | null>(null);
  const [allHoldings, setAllHoldings] = useState<HoldingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 초기 진입 시 DB 데이터 로드
  const fetchInitialData = useCallback(async () => {
    if (!walletId) {
      return;
    }

    try {
      setLoading(true);

      const [info, list] = await Promise.all([
        myPageApi.getWalletInfo(),
        myPageApi.getHoldings(0), // 전체 조회
      ]);

      setWalletInfo(info);
      setAllHoldings(list ?? []);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [walletId]);

  // 2. 실시간 지표 계산 (allHoldings나 walletInfo가 변할 때마다 실행)
  const realTimeSummary = useMemo(() => {
    if (!walletInfo) return null;

    const cash = Number(walletInfo.cashBalance);
    const frozen = Number(walletInfo.frozenAmount);
    const availableBalance = cash - frozen;

    // 리스트 내 개별 항목들의 marketValue 합산
    const totalMarketValue = allHoldings.reduce(
      (sum, h) => sum + Number(h.marketValue || 0),
      0,
    );
    const totalPurchased = Number(walletInfo.totalPurchasedValue);

    const totalBalance = cash + totalMarketValue;
    const profitLoss = totalMarketValue - totalPurchased;
    const profitLossRate =
      totalPurchased === 0 ? 0 : (profitLoss / totalPurchased) * 100;

    return {
      ...walletInfo,
      availableBalance,
      totalMarketValue,
      totalBalance,
      profitLoss,
      profitLossRate,
    };
  }, [walletInfo, allHoldings]);

  useEffect(() => {
    if (!walletId) return;
    let walletSub: string;
    let priceSub: string;

    fetchInitialData().then(() => {
      const url = import.meta.env.VITE_WS_URL;
      WebSocketManager.connect(url, () => {
        // [채널 A] 개인 지갑 업데이트 (체결/취소/동결 발생 시)
        walletSub = `wallet-${walletId}`;
        WebSocketManager.subscribe(
          walletSub,
          `/topic/wallet/${walletId}`,
          (data: WalletUpdate) => {
            // 1. 상단 잔고 정보 갱신 (현금, 동결금액, 총매입금액)
            setWalletInfo((prev) =>
              prev
                ? {
                    ...prev,
                    cashBalance: data.cashBalance,
                    frozenAmount: data.frozenAmount,
                    totalPurchasedValue: data.totalPurchasedValue,
                  }
                : null,
            );

            // 2. 리스트 내 수량 및 매입가 갱신
            setAllHoldings((prev) => {
              const idx = prev.findIndex((h) => h.tokenId === data.tokenId);
              // 수량이 0이면 리스트에서 제거 (전량 매도 등)
              if (data.tokenQty <= 0)
                return prev.filter((h) => h.tokenId !== data.tokenId);

              const next = [...prev];
              if (idx !== -1) {
                // 기존 종목 업데이트
                next[idx] = {
                  ...next[idx],
                  tokenBalance: data.tokenQty,
                  purchasedValue: data.tokenPurchasedVal,
                };
              } else {
                // 신규 종목 진입
                next.unshift({
                  tokenId: data.tokenId,
                  tokenName: data.tokenName,
                  tickerSymbol: data.tickerSymbol,
                  tokenBalance: data.tokenQty,
                  purchasedValue: data.tokenPurchasedVal,
                  marketValue: 0, // 다음 시세 소켓에서 업데이트됨
                  profitLoss: 0,
                  profitLossRate: 0,
                });
              }
              return next;
            });
          },
        );

        // [채널 B] 공통 시세 업데이트 (내 거래와 상관없이 가격 변동 시)
        priceSub = `price-all`;
        WebSocketManager.subscribe(
          priceSub,
          `/topic/market/prices`,
          (priceData: MarketPriceDTO) => {
            setAllHoldings((prev) =>
              prev.map((h) => {
                if (h.tokenId === priceData.tokenId) {
                  const currentPrice = Number(priceData.currentPrice);
                  const newMarketValue = Number(h.tokenBalance) * currentPrice;
                  const profitLoss = newMarketValue - Number(h.purchasedValue);

                  return {
                    ...h,
                    marketValue: newMarketValue,
                    profitLoss: profitLoss,
                    profitLossRate:
                      Number(h.purchasedValue) === 0
                        ? 0
                        : (profitLoss / Number(h.purchasedValue)) * 100,
                  };
                }
                return h;
              }),
            );
          },
        );
      });
    });

    return () => {
      WebSocketManager.unsubscribe(walletSub);
      WebSocketManager.unsubscribe(priceSub);
    };
  }, [walletId, fetchInitialData]);

  return {
    walletInfo: realTimeSummary,
    holdings: allHoldings,
    loading,
  };
};
