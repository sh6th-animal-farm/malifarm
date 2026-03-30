import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProjectList } from '@/types/projectType';
import ProjectCard from '@/components/common/ProjectCard';
import RegionAccordion from '@/pages/project/components/RegionAccordion';
import { projectApi } from '@/api/projectApi';
import FilterGroup from '@/components/common/FilterGroup';
import SectionHeader from '@/components/layout/SectionHeader';

// --- 내부 컴포넌트: 섹션 헤더 ---

declare global {
  interface Window {
    kakao: any;
  }
}

export default function ProjectList() {
  // 1. 상태 관리
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectList[]>([]);
  const [starredIds, setStarredIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState(
    searchParams.get('projectStatus') || 'ALL',
  );

  // API 데이터 로딩
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const resData = await projectApi.getAllProjects();
        if (resData) {
          const formattedData = resData.map((p: ProjectList) => {
            // 1. 카드 상단 노출용 날짜 (시작일 ~ 종료일)
            const formatDate = (dateStr: string) =>
              dateStr ? dateStr.split('T')[0] : '';
            const upperDateText = `${formatDate(p.subscriptionStartDate)} ~ ${formatDate(p.subscriptionEndDate)}`;

            // 2. 카드 하단 운영기간용 날짜
            const lowerDateText = `${formatDate(p.projectStartDate)} ~ ${formatDate(p.projectEndDate)}`;

            // 3. 타이머 기준 날짜 설정
            const countdownTarget =
              p.projectStatus === 'SUBSCRIPTION'
                ? p.subscriptionEndDate
                : p.projectStatus === 'ANNOUNCEMENT'
                  ? p.subscriptionStartDate
                  : null;

            return {
              ...p,
              // ProjectCard 컴포넌트가 사용하는 이름으로 브릿지 연결
              id: p.projectId,
              title: p.projectName,
              status: p.projectStatus,

              // UI 표시용 가공 데이터
              countdownTarget: countdownTarget,
              percent: p.subscriptionRate, // 729.14 그대로 사용
              upperDate: upperDateText,
              lowerDate: lowerDateText,

              // 스크린샷의 thumbnailUrl을 그대로 사용 (없을 때만 기본값)
              thumbnailUrl:
                p.thumbnailUrl ||
                'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1000',
            };
          });

          setProjects(formattedData);
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

    if (!KAKAO_KEY) {
      console.error(
        '카카오 맵 API 키가 설정되지 않았습니다. .env 파일을 확인하세요.',
      );
      return;
    }

    // 이미 스크립트가 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.kakao.maps.load(() => {
          initMap();
        });
      };

      script.onerror = () => {
        console.error(
          '스크립트 로드 자체에 실패했습니다. 네트워크 상태나 도메인 제한을 확인하세요.',
        );
      };

      document.head.appendChild(script);
    }
  }, []);

  const initMap = () => {
    const container = document.getElementById('map');
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(36.3504, 127.3845),
      level: 10,
    };
    const map = new window.kakao.maps.Map(container, options);
    setMapInstance(map);
  };

  useEffect(() => {
    if (!mapInstance || projects.length === 0) return;
    console.log(projects);
    // 1. 기존에 찍힌 마커가 있다면 지워주는 로직이 필요할 수 있지만,
    // 초기 로드 시에는 아래와 같이 바로 생성합니다.
    projects.forEach((project) => {
      // 백엔드에서 내려주는 위도/경도 필드명을 확인하세요 (예: latitude, longitude)
      if (project.latitude && project.longitude) {
        const position = new window.kakao.maps.LatLng(
          project.latitude,
          project.longitude,
        );

        // 마커 생성 및 지도 표시
        const marker = new window.kakao.maps.Marker({
          position: position,
          map: mapInstance,
          title: project.projectName,
        });

        // (옵션) 마커 클릭 시 해당 프로젝트 카드로 스크롤하거나 정보를 띄울 수 있습니다.
        window.kakao.maps.event.addListener(marker, 'click', () => {
          mapInstance.panTo(position);
        });
      }
    });
  }, [mapInstance, projects]);

  const handleToggleStar = async (projectId: number) => {
    try {
      const response = await projectApi.toggleStar(projectId);

      // 200 OK가 떴다면 response.data 안에 우리가 만든 ApiResponseDTO가 있습니다.
      // 여기서 실제 불리언 값은 response.data.data에 들어있을 확률이 높습니다.
      const isStarred = response.data.data;

      console.log('서버가 알려준 최종 상태:', isStarred);

      setStarredIds((prev) =>
        isStarred
          ? [...prev, projectId]
          : prev.filter((id) => id !== projectId),
      );
    } catch (error: any) {
      // 200 OK인데 catch로 왔다면, 위쪽 try문 내부의 코드(isStarred 정의 등)에서 오타가 난 것입니다.
      console.error('데이터 처리 중 에러 발생:', error);
    }
  };

  const handleFilter = (status: string) => {
    setActiveStatus(status);
    if (status === 'ALL') {
      searchParams.delete('projectStatus');
    } else {
      searchParams.set('projectStatus', status);
    }
    setSearchParams(searchParams);
  };

  const filteredProjects = projects.filter((p) => {
    const isHiddenStatus =
      p.projectStatus === 'CANCELED' || p.projectStatus === 'COMPLETED';
    if (isHiddenStatus) return false;
    if (activeStatus === 'ALL') return true;
    return p.projectStatus === activeStatus;
  });

  const filterItems = [
    { text: '전체보기', value: 'ALL' },
    { text: '청약중', value: 'SUBSCRIPTION' },
    { text: '공고중', value: 'ANNOUNCEMENT' },
    { text: '진행중', value: 'INPROGRESS' },
  ];

  // 2. 필터 변경 핸들러
  const handleFilterChange = (value: string) => {
    setActiveStatus(value);
    if (value === 'ALL') {
      searchParams.delete('projectStatus');
    } else {
      searchParams.set('projectStatus', value);
    }
    setSearchParams(searchParams);
  };
  return (
    <div className="min-h-screen bg-white font-main antialiased">
      <div className="max-w-[1200px] mx-auto p-4 py-16">
        {/* [지도 섹션] */}
        <SectionHeader
          title="프로젝트 지도"
          subtitle="진행중인 프로젝트를 지도에서 확인하세요"
        />
        <div className="flex flex-col lg:flex-row gap-[24px] h-[400px] mb-20 items-stretch">
          <div className="w-full lg:w-[320px] h-full flex-shrink-0">
            <RegionAccordion
              onRegionSelect={(lat: number, lng: number, lvl: number) => {
                if (mapInstance) {
                  // STS에서 가져온 위경도로 지도를 이동시킴
                  const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
                  mapInstance.setCenter(moveLatLon);
                  mapInstance.setLevel(lvl);
                }
              }}
            />
          </div>

          {/* 지도가 그려질 영역: 반드시 h-full과 min-height가 보장되어야 함 */}
          <div className="flex-1 h-full relative">
            <div
              id="map"
              className="w-full h-full rounded-[20px] border border-gray-200 bg-gray-50 shadow-sm"
              // Kakao Map API는 내부적으로 height: 100%가 보장되어야 하므로 인라인 스타일 유지
              style={{ height: '100%' }}
            />
          </div>
        </div>

        {/* [목록 섹션] */}
        <SectionHeader
          title="프로젝트 목록"
          subtitle="프로젝트를 선택하여 자세한 정보를 확인하세요"
        />

        {/* 필터 컨트롤바 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="p-1.5 rounded-2xl">
            <FilterGroup
              items={filterItems}
              currentValue={activeStatus}
              onFilterChange={handleFilter} // 기존 handleFilter 함수 그대로 사용
            />
          </div>
        </div>

        {/* 프로젝트 카드 그리드 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.projectId}
                  project={project}
                  starred={starredIds.includes(project.projectId)}
                  onToggleStar={handleToggleStar}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-3xl">
                해당 조건에 맞는 프로젝트가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
