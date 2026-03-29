import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProjectList } from '@/types/projectType';
import ProjectCard from '@/components/common/ProjectCard';
import RegionAccordion from '@/pages/project/components/RegionAccordion';
import { projectApi } from '@/api/projectApi';

// --- 내부 컴포넌트: 섹션 헤더 ---
const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="mb-8">
    <h2 className="text-[28px] font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 font-medium text-lg">{subtitle}</p>
    <div className="w-12 h-1.5 bg-green-600 mt-4 rounded-full" />
  </div>
);

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
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(36.3504, 127.3845),
          level: 8,
        };
        const map = new window.kakao.maps.Map(container, options);
        setMapInstance(map);
      });
    }
  }, []);

  const moveToRegion = useCallback(
    (lat: number, lng: number, level: number) => {
      if (mapInstance) {
        const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
        mapInstance.setCenter(moveLatLon);
        mapInstance.setLevel(level);
      }
    },
    [mapInstance],
  );

  const handleToggleStar = (projectId: number) => {
    setStarredIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
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
    if (activeStatus === 'ALL') return true;
    return p.projectStatus === activeStatus;
  });

  return (
    <div className="min-h-screen bg-white font-main antialiased">
      <div className="max-w-[1200px] mx-auto p-4 py-16">
        {/* [지도 섹션] */}
        <SectionHeader
          title="프로젝트 지도"
          subtitle="진행중인 프로젝트를 지도에서 확인하세요"
        />
        <div className="flex flex-col lg:flex-row gap-6 h-[560px] mb-24">
          <div className="w-full lg:w-[320px] h-full">
            {/* 자식 컴포넌트: 아코디언 */}
            <RegionAccordion onRegionSelect={moveToRegion} />
          </div>
          <div
            id="map"
            className="flex-1 rounded-[20px] border border-gray-200 bg-gray-50 shadow-sm overflow-hidden"
          />
        </div>

        {/* [목록 섹션] */}
        <SectionHeader
          title="프로젝트 목록"
          subtitle="프로젝트를 선택하여 자세한 정보를 확인하세요"
        />

        {/* 필터 컨트롤바 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl">
            {[
              { label: '전체보기', value: 'ALL' },
              { label: '청약중', value: 'SUBSCRIPTION' },
              { label: '공고중', value: 'ANNOUNCEMENT' },
              { label: '진행중', value: 'INPROGRESS' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => handleFilter(item.value)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeStatus === item.value
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-[360px]">
            <input
              type="text"
              placeholder="프로젝트명을 검색하세요"
              className="w-full h-[54px] pl-12 pr-6 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
              🔍
            </span>
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
                  project={project} // 가공된 project 객체 전달
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
