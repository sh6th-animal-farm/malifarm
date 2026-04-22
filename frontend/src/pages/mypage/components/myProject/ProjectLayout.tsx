import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import FilterGroup from "@/components/common/FilterGroup";
import TabMenu from "@/components/common/TabMenu";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import PageHeader from "@/pages/mypage/components/PageHeader";
import { myPageApi } from "@/api/myPageApi";
import type { MyPageProjectDTO, ProjectTabsDTO } from "@/types/myPageType";
import ProjectTable from "./ProjectTable";

type ProjectTab = "JOIN" | "STAR";
type ProjectFilter =
  | "ALL"
  | "SUBSCRIPTION"
  | "ANNOUNCEMENT"
  | "INPROGRESS"
  | "COMPLETED"
  | "CANCELED";

const joinFilters = [
  { text: "전체보기", value: "ALL" },
  { text: "청약중", value: "SUBSCRIPTION" },
  { text: "진행중", value: "INPROGRESS" },
  { text: "종료", value: "COMPLETED" },
  { text: "취소", value: "CANCELED" },
];

const starFilters = [
  { text: "전체보기", value: "ALL" },
  { text: "청약중", value: "SUBSCRIPTION" },
  { text: "진행중", value: "INPROGRESS" },
  { text: "공고중", value: "ANNOUNCEMENT" },
  { text: "종료", value: "COMPLETED" },
  { text: "취소", value: "CANCELED" },
];

export default function ProjectLayout() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ProjectTab>("JOIN");
  const [filter, setFilter] = useState<ProjectFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [projects, setProjects] = useState<MyPageProjectDTO[]>([]);
  const [tabCounts, setTabCounts] = useState<ProjectTabsDTO>({
    joinedCount: 0,
    starredCount: 0,
  });

  const tabs = useMemo(
    () => [
      { text: "참여한 프로젝트", value: "JOIN", count: tabCounts.joinedCount },
      { text: "관심 프로젝트", value: "STAR", count: tabCounts.starredCount },
    ],
    [tabCounts.joinedCount, tabCounts.starredCount],
  );
  const filters = tab === "JOIN" ? joinFilters : starFilters;

  useEffect(() => {
    const fetchTabCounts = async () => {
      try {
        const data = await myPageApi.getProjectTabs();
        setTabCounts(data);
      } catch (error) {
        console.error("프로젝트 탭 카운트 로드 실패", error);
      }
    };

    fetchTabCounts();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setPage(1);
        const data = await myPageApi.getProjects({
          type: tab,
          status: filter,
          page: 1,
          size: 10,
        });
        setProjects(data.items ?? []);
        setHasNext(Boolean(data.hasNext));
      } catch (error) {
        console.error("나의 프로젝트 로드 실패", error);
        setProjects([]);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [tab, filter]);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const canLoadMore = hasNext && !loading;
  const moveToProjectDetail = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };
  const handleLoadMore = async () => {
    if (!hasNext || loadingMore || loading) return;

    const nextPage = page + 1;
    try {
      setLoadingMore(true);
      const data = await myPageApi.getProjects({
        type: tab,
        status: filter,
        page: nextPage,
        size: 10,
      });
      setProjects((prev) => [...prev, ...(data.items ?? [])]);
      setPage(nextPage);
      setHasNext(Boolean(data.hasNext));
    } catch (error) {
      console.error("나의 프로젝트 추가 로드 실패", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className={isMobile ? "flex h-full flex-col overflow-hidden" : ""}>
      {isMobile ? (
        <div className="shrink-0 border-b border-gray-100 bg-white">
          <TabMenu
            items={tabs}
            currentValue={tab}
            onTabChange={(value) => {
              setTab(value as ProjectTab);
              setFilter("ALL");
            }}
            tabPaddingY={8}
            gap={0}
            marginY={0}
            equalWidth
            className="px-4"
          />
        </div>
      ) : (
        <>
          <PageHeader
            title="나의 프로젝트"
            subtitle="참여 중이거나 관심 있는 농업 재생 프로젝트 현황입니다."
          />

          <TabMenu
            items={tabs}
            currentValue={tab}
            onTabChange={(value) => {
              setTab(value as ProjectTab);
              setFilter("ALL");
            }}
            marginY={0}
          />
        </>
      )}

      <div className={isMobile ? "flex-1 overflow-y-auto" : ""}>
        
        <div
          className={
            isMobile
              ? "layout-container pt-4"
              : "layout-container py-4"
          }
        >
          <FilterGroup
            items={filters}
            currentValue={filter}
            onFilterChange={(value) => setFilter(value as ProjectFilter)}
          />
        </div>

        <div className={isMobile ? "layout-container py-4" : ""}>
          <ProjectTable
            loading={loading}
            projects={projects}
            onMove={moveToProjectDetail}
          />

          {canLoadMore ? (
            <div className="mt-6">
              <LoadMoreButton onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? "불러오는 중..." : "+ 더보기"}
              </LoadMoreButton>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
