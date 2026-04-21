import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import PageHeader from "@/pages/mypage/components/PageHeader";
import { myPageApi } from "@/api/myPageApi";
import type { CarbonHistoryDTO } from "@/types/myPageType";
import CarbonTable from "./CarbonTable";

export default function CarbonLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CarbonHistoryDTO[]>([]);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const fetchCarbonHistory = async () => {
      try {
        setLoading(true);
        const list = await myPageApi.getCarbonHistory();
        setItems(list ?? []);
      } catch (error) {
        console.error("탄소 배출권 구매 내역 로드 실패", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarbonHistory();
  }, []);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const canLoadMore = visibleCount < items.length;

  return (
    <div className="layout-container py-4 md:py-0">
      <PageHeader
        title="탄소 배출권 구매 내역"
        subtitle="회원님이 구매하신 탄소 배출권의 상세 내역을 확인하세요."
        rightSlot={
          <Button
            variant="default"
            width={138}
            height={44}
            onClick={() => navigate("/carbon/list")}
          >
            마켓으로 이동
          </Button>
        }
      />

      <CarbonTable loading={loading} items={visibleItems} />

      {canLoadMore ? (
        <LoadMoreButton onClick={() => setVisibleCount((prev) => prev + 10)}>
          + 더보기
        </LoadMoreButton>
      ) : null}
    </div>
  );
}
