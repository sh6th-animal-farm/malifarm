import { useCallback, useEffect, useState } from "react";
import Button from "@/components/common/Button";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import TabMenu from "@/components/common/TabMenu";
import Icon from "@/components/icon";
import { myPageApi } from "@/api/myPageApi";
import PageHeader from "@/pages/mypage/components/PageHeader";
import type { HoldingDTO, WalletInfoDTO } from "@/types/myPageType";
import Investment from "./Investment";
import TokenTable from "./TokenTable";
import Account from "./Account";

export default function WalletLayout() {
  const [tab, setTab] = useState("HOLDINGS");
  const [loading, setLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [holdingsLoadingMore, setHoldingsLoadingMore] = useState(false);
  const [holdingsPage, setHoldingsPage] = useState(1);
  const [holdingsHasNext, setHoldingsHasNext] = useState(false);
  const [nextHoldings, setNextHoldings] = useState<HoldingDTO[] | null>(null);
  const [linking, setLinking] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfoDTO | null>(null);
  const [holdings, setHoldings] = useState<HoldingDTO[]>([]);

  const fetchWalletData = useCallback(async () => {
    try {
      const wallet = await myPageApi.getWalletInfo();
      setWalletInfo(wallet);
    } catch (error) {
      console.error("지갑 정보 로드 실패", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHoldings = useCallback(async () => {
    try {
      setHoldingsLoading(true);
      setHoldingsPage(1);
      const [holdingList, nextPageList] = await Promise.all([
        myPageApi.getHoldings(1),
        myPageApi.getHoldings(2),
      ]);
      const firstPageItems = holdingList ?? [];
      const prefetchedItems = nextPageList ?? [];
      setHoldings(firstPageItems);
      setNextHoldings(prefetchedItems);
      setHoldingsHasNext(prefetchedItems.length > 0);
    } catch (error) {
      console.error("보유 토큰 로드 실패", error);
      setHoldings([]);
      setNextHoldings([]);
      setHoldingsHasNext(false);
    } finally {
      setHoldingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
    fetchHoldings();
  }, [fetchWalletData, fetchHoldings]);

  const handleLinkAccount = async () => {
    try {
      setLinking(true);
      await myPageApi.linkAccount();
      await Promise.all([fetchWalletData(), fetchHoldings()]);
    } catch (error) {
      console.error("계좌 연동 실패", error);
    } finally {
      setLinking(false);
    }
  };

  const handleLoadMoreHoldings = async () => {
    if (holdingsLoading || holdingsLoadingMore || !holdingsHasNext) return;
    const nextPage = holdingsPage + 1;
    try {
      setHoldingsLoadingMore(true);
      const appendItems = nextHoldings ?? [];
      if (appendItems.length === 0) {
        setHoldingsHasNext(false);
        return;
      }
      setHoldings((prev) => [...prev, ...appendItems]);
      setHoldingsPage(nextPage);
      const prefetchedFollowing = await myPageApi.getHoldings(nextPage + 1);
      const followingItems = prefetchedFollowing ?? [];
      setNextHoldings(followingItems);
      setHoldingsHasNext(followingItems.length > 0);
    } catch (error) {
      console.error("보유 토큰 추가 로드 실패", error);
    } finally {
      setHoldingsLoadingMore(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="나의 전자지갑"
        subtitle="연동된 증권 계좌와 실시간 투자 현황을 확인하세요."
        rightSlot={
          <Button
            variant="default"
            width={138}
            height={44}
            onClick={handleLinkAccount}
            disabled={linking}
          >
            <span className="inline-flex items-center gap-1">
              <Icon name="link" size={14} color="white" />
              {linking ? "연동 중..." : "계좌 연동"}
            </span>
          </Button>
        }
      />

      <Account walletInfo={walletInfo} loading={loading} />
      <Investment walletInfo={walletInfo} />

      <TabMenu
        className="mb-4"
        items={[{ text: "보유 토큰", value: "HOLDINGS" }]}
        currentValue={tab}
        onTabChange={setTab}
      />

      <TokenTable loading={holdingsLoading} holdings={holdings} />

      {!holdingsLoading && holdings.length > 0 && holdingsHasNext ? (
        <div className="mt-6">
          <LoadMoreButton onClick={handleLoadMoreHoldings} disabled={holdingsLoadingMore}>
            {holdingsLoadingMore ? "불러오는 중..." : "+ 더보기"}
          </LoadMoreButton>
        </div>
      ) : null}
    </div>
  );
}
