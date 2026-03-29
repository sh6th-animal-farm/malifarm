import { useEffect, useMemo, useState } from "react";
import FilterGroup from "@/components/common/FilterGroup";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import TabMenu from "@/components/common/TabMenu";
import PageHeader from "@/pages/mypage/components/PageHeader";
import { myPageApi } from "@/api/myPageApi";
import type { MyTransactionHistDTO } from "@/types/myPageType";
import { toCategory } from "./transactionFormatters";
import TransactionTable from "./TransactionTable";

const tabs = [
  { text: "토큰", value: "TOKEN" },
  { text: "프로젝트", value: "PROJECT" },
];

const tokenFilters = [
  { text: "전체보기", value: "ALL" },
  { text: "매수", value: "BUY" },
  { text: "매도", value: "SELL" },
];

const projectFilters = [
  { text: "전체보기", value: "ALL" },
  { text: "당첨(청약)", value: "PASS" },
  { text: "낙첨(환불)", value: "FAIL" },
  { text: "배당", value: "DIVIDEND" },
  { text: "소각", value: "BURN" },
];

export default function TransactionLayout() {
  const [tab, setTab] = useState("TOKEN");
  const [filter, setFilter] = useState("ALL");
  const [period, setPeriod] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [transactions, setTransactions] = useState<MyTransactionHistDTO[]>([]);
  const [nextTransactions, setNextTransactions] = useState<MyTransactionHistDTO[] | null>(null);

  const category = useMemo(() => toCategory(tab, filter), [tab, filter]);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        setPage(1);
        const [list, nextList] = await Promise.all([
          myPageApi.getTransactionHistory({
            page: 1,
            period,
            category,
          }),
          myPageApi.getTransactionHistory({
            page: 2,
            period,
            category,
          }),
        ]);
        const firstPageItems = list ?? [];
        const prefetchedItems = nextList ?? [];
        setTransactions(firstPageItems);
        setNextTransactions(prefetchedItems);
        setHasNext(prefetchedItems.length > 0);
      } catch (error) {
        console.error("거래 내역 로드 실패", error);
        setTransactions([]);
        setNextTransactions([]);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [category, period]);

  const handleLoadMore = async () => {
    if (loading || loadingMore || !hasNext) return;

    const nextPage = page + 1;
    try {
      setLoadingMore(true);
      const nextItems = nextTransactions ?? [];
      if (nextItems.length === 0) {
        setHasNext(false);
        return;
      }
      setTransactions((prev) => [...prev, ...nextItems]);
      setPage(nextPage);
      const prefetchedFollowing = await myPageApi.getTransactionHistory({
        page: nextPage + 1,
        period,
        category,
      });
      const followingItems = prefetchedFollowing ?? [];
      setNextTransactions(followingItems);
      setHasNext(followingItems.length > 0);
    } catch (error) {
      console.error("거래 내역 추가 로드 실패", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="거래 내역"
        subtitle="투자, 충전, 정산 등 모든 거래 기록을 확인하세요."
      />

      <TabMenu
        items={tabs}
        currentValue={tab}
        onTabChange={(next) => {
          setTab(next);
          setFilter("ALL");
        }}
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterGroup
          items={tab === "TOKEN" ? tokenFilters : projectFilters}
          currentValue={filter}
          onFilterChange={setFilter}
        />
        <select
          value={period}
          onChange={(event) => setPeriod(Number(event.target.value))}
          className="w-full rounded-[var(--radius-s)] border border-gray-100 bg-white px-3 py-2 font-caption-01 text-gray-700 md:w-28"
        >
          <option value={0}>전체 기간</option>
          <option value={1}>최근 1개월</option>
          <option value={3}>최근 3개월</option>
          <option value={6}>최근 6개월</option>
        </select>
      </div>

      <TransactionTable loading={loading} transactions={transactions} />

      {!loading && transactions.length > 0 && hasNext ? (
        <div className="mt-6">
          <LoadMoreButton onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? "불러오는 중..." : "+ 더보기"}
          </LoadMoreButton>
        </div>
      ) : null}
    </div>
  );
}
