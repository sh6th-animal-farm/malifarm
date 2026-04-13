import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';

import ProjectGrid from '@/pages/project/components/ProjectGrid';
import FilterGroup from '@/components/common/FilterGroup';
import Pagination from '@/components/common/Pagination';
import SectionHeader from '@/components/layout/SectionHeader';
import { useKakaoMap } from '@/pages/project/hook/useKakaoMap';
import MapSection from '@/pages/project/hook/MapSection';
import { useStarreds } from '@/pages/project/hook/useStarreds';

const PROJECT_LIST_RESTORE_KEY = 'project-list-restore-state';

type ProjectListRestoreState = {
  currentPage: number;
  scrollY: number;
  activeStatus: string;
};

export default function ProjectList() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingRestore] = useState<ProjectListRestoreState | null>(() => {
    const raw = sessionStorage.getItem(PROJECT_LIST_RESTORE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as ProjectListRestoreState;
      if (
        typeof parsed.currentPage === 'number' &&
        typeof parsed.scrollY === 'number' &&
        typeof parsed.activeStatus === 'string'
      ) {
        return parsed;
      }
    } catch (error) {
      console.error('리스트 복원 상태 파싱 실패:', error);
    }
    return null;
  });

  const shouldRestoreRef = useRef(Boolean(pendingRestore));
  const hasRestoredScrollRef = useRef(false);
  const itemsPerPage = 9;

  // 관심 프로젝트 상태 관리 훅
  const { projects, setProjects, handleToggleStar } = useStarreds([]);

  const activeStatus = searchParams.get('projectStatus') || 'ALL';
  const saveListViewState = useCallback(() => {
    const restoreState: ProjectListRestoreState = {
      currentPage,
      scrollY: window.scrollY,
      activeStatus,
    };
    sessionStorage.setItem(
      PROJECT_LIST_RESTORE_KEY,
      JSON.stringify(restoreState),
    );
  }, [activeStatus, currentPage]);

  const mapInstance = useKakaoMap('map', projects);

  useEffect(() => {
    saveListViewState();
  }, [saveListViewState]);

  useEffect(() => {
    const handleScroll = () => {
      saveListViewState();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [saveListViewState]);

  // [Effect] 데이터 로딩 - 필터가 변경될 때마다 실행
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        // API 하나로 목록, 농장 좌표, 관심 상태를 한꺼번에 가져옵니다.
        const response = await projectApi.getProjectsByCondition({
          projectStatus: activeStatus === 'ALL' ? '' : activeStatus,
        });
        console.log('API 응답:', response);
        const nextProjects = response || [];
        setProjects(nextProjects);

        if (
          shouldRestoreRef.current &&
          pendingRestore &&
          pendingRestore.activeStatus === activeStatus
        ) {
          const totalPages = Math.max(
            1,
            Math.ceil(nextProjects.length / itemsPerPage),
          );
          const restoredPage = Math.min(
            totalPages,
            Math.max(1, pendingRestore.currentPage),
          );
          setCurrentPage(restoredPage);
        } else {
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [activeStatus, pendingRestore]);

  useEffect(() => {
    if (!pendingRestore || hasRestoredScrollRef.current || isLoading) {
      return;
    }
    if (
      !shouldRestoreRef.current ||
      pendingRestore.activeStatus !== activeStatus
    ) {
      shouldRestoreRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      window.scrollTo(0, pendingRestore.scrollY);
      hasRestoredScrollRef.current = true;
      shouldRestoreRef.current = false;
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeStatus, isLoading, pendingRestore]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  // [Handlers]
  const handleFilterChange = (status: string) => {
    if (status === 'ALL') {
      searchParams.delete('projectStatus');
    } else {
      searchParams.set('projectStatus', status);
    }
    setSearchParams(searchParams);
  };

  const handleRegionSelect = (lat: number, lng: number, lvl: number) => {
    if (mapInstance) {
      mapInstance.setCenter(new window.kakao.maps.LatLng(lat, lng));
      mapInstance.setLevel(lvl);
    }
  };

  const listRef = useRef<HTMLDivElement>(null);

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    if (listRef.current) {
      listRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });
    }
  };

  return (
    <div>
      <div className="bg-gray-50">
        <section className="layout-container py-20 md:pt-20">
          <SectionHeader
            title="프로젝트 지도"
            subtitle="진행중인 프로젝트를 지도에서 확인하세요"
          />
          <MapSection
            mapInstance={mapInstance}
            onRegionSelect={handleRegionSelect}
          />
        </section>
      </div>
      <div className="">
        <section className="layout-container py-20 my:pb-20">
          <div ref={listRef}>
            <SectionHeader
              title="프로젝트 목록"
              subtitle="프로젝트를 선택하여 자세한 정보를 확인하세요"
            />
          </div>
          <div className="mb-10">
            <FilterGroup
              items={[
                { text: '전체보기', value: 'ALL' },
                { text: '청약중', value: 'SUBSCRIPTION' },
                { text: '공고중', value: 'ANNOUNCEMENT' },
                { text: '진행중', value: 'INPROGRESS' },
              ]}
              currentValue={activeStatus}
              onFilterChange={handleFilterChange}
            />
          </div>

          <ProjectGrid
            projects={currentProjects}
            activeStatus={activeStatus}
            isLoading={isLoading}
            onToggleStar={handleToggleStar}
            onBeforeNavigateDetail={saveListViewState}
            detailNavigationState={{ from: 'project-list' }}
          />

          {!isLoading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-16"
            />
          )}
        </section>
      </div>
    </div>
  );
}
