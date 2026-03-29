import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterGroup from "@/components/common/FilterGroup";
import TabMenu from "@/components/common/TabMenu";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import PageHeader from "@/pages/mypage/components/PageHeader";
import { myPageApi } from "@/api/myPageApi";
import type { MyPageProjectDTO, ProjectTabsDTO } from "@/types/myPageType";
import ProjectTable from "./ProjectTable";

type ProjectTab = "JOIN" | "STAR";
type ProjectFilter = "ALL" | "SUBSCRIPTION" | "ANNOUNCEMENT" | "ENDED";

const filters = [
  { text: "전체보기", value: "ALL" },
  { text: "청약중", value: "SUBSCRIPTION" },
  { text: "공고중", value: "ANNOUNCEMENT" },
  { text: "종료됨", value: "ENDED" },
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
    <div>
      <PageHeader
        title="나의 프로젝트"
        subtitle="참여 중이거나 관심 있는 농업 재생 프로젝트 현황입니다."
      />

      <TabMenu
        items={tabs}
        currentValue={tab}
        onTabChange={(value) => setTab(value as ProjectTab)}
      />

      <div className="mb-5">
        <FilterGroup
          items={filters}
          currentValue={filter}
          onFilterChange={(value) => setFilter(value as ProjectFilter)}
        />
      </div>

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
  );
}
