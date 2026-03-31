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
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('projectStatus') || 'ALL';

  // [Hook] 지도 인스턴스 관리 - projects 데이터가 바뀌면 마커도 자동 갱신
  const mapInstance = useKakaoMap('map', projects);

  // [Effect] 데이터 로딩 - 필터가 변경될 때마다 실행
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        // API 하나로 목록, 농장 좌표, 하트 상태를 한꺼번에 가져옵니다.
        const response = await projectApi.getProjectsByCondition({
          projectStatus: activeStatus === 'ALL' ? '' : activeStatus,
        });
        console.log('API 응답:', response);
        setProjects(response || []);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [activeStatus]);

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

  const handleToggleStar = async (projectId: number) => {
    try {
      await projectApi.toggleStar(projectId);
      // 서버에서 새로 고침하지 않고, 현재 projects 배열에서 해당 아이템의 하트 상태만 반전
      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === projectId ? { ...p, isStarred: !p.isStarred } : p,
        ),
      );
    } catch (error) {
      console.error('하트 토글 실패', error);
    }
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
          onToggleStar={handleToggleStar}
        />
      </div>
    </div>
  );
}
