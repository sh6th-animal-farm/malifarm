import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';

import ProjectGrid from '@/pages/project/components/ProjectGrid';
import FilterGroup from '@/components/common/FilterGroup';
import Pagination from '@/components/common/Pagination';
import SectionHeader from '@/components/layout/SectionHeader';
import { useKakaoMap } from '@/pages/project/hook/useKakaoMap';
import MapSection from '@/pages/project/hook/MapSection';
import { useStarreds } from '@/pages/project/hook/useStarreds';

export default function ProjectList() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // 관심 프로젝트 상태 관리 훅
  const { projects, setProjects, handleToggleStar } = useStarreds([]);

  const activeStatus = searchParams.get('projectStatus') || 'ALL';
  const mapInstance = useKakaoMap('map', projects);

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
        setProjects(response || []);
        setCurrentPage(1);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [activeStatus]);

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
      <div className='bg-white'>
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
      <div className=''>
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
