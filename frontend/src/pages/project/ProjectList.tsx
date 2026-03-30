import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';

import ProjectGrid from './components/ProjectGrid';
import FilterGroup from '@/components/common/FilterGroup';
import SectionHeader from '@/components/layout/SectionHeader';
import { useKakaoMap } from './hook/useKakaoMap';
import MapSection from './hook/MapSection';

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [starredIds, setStarredIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('projectStatus') || 'ALL';

  // [Hook] 지도 인스턴스 관리
  const mapInstance = useKakaoMap('map', projects);

  // [Effect] 초기 데이터 로딩
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const data = await projectApi.getAllProjects();
        // 데이터 가공 로직이 필요하다면 여기서 수행 (상태값 포맷팅 등)
        setProjects(data || []);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // [Handlers]
  const handleFilterChange = (status: string) => {
    status === 'ALL'
      ? searchParams.delete('projectStatus')
      : searchParams.set('projectStatus', status);
    setSearchParams(searchParams);
  };

  const handleRegionSelect = (lat: number, lng: number, lvl: number) => {
    if (mapInstance) {
      mapInstance.setCenter(new window.kakao.maps.LatLng(lat, lng));
      mapInstance.setLevel(lvl);
    }
  };

  const handleToggleStar = async (projectId: number) => {
    const res = await projectApi.toggleStar(projectId);
    const isStarred = res.data.data;
    setStarredIds((prev) =>
      isStarred ? [...prev, projectId] : prev.filter((id) => id !== projectId),
    );
  };

  return (
    <div className="min-h-screen bg-white font-main antialiased">
      <div className="max-w-[1200px] mx-auto p-4 py-16">
        <SectionHeader
          title="프로젝트 지도"
          subtitle="진행중인 프로젝트를 지도에서 확인하세요"
        />
        <MapSection
          mapInstance={mapInstance}
          onRegionSelect={handleRegionSelect}
        />

        <SectionHeader
          title="프로젝트 목록"
          subtitle="프로젝트를 선택하여 자세한 정보를 확인하세요"
        />

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
          projects={projects}
          activeStatus={activeStatus}
          isLoading={isLoading}
          starredIds={starredIds}
          onToggleStar={handleToggleStar}
        />
      </div>
    </div>
  );
}
