import React, { useState } from 'react';
import { REGIONS } from './regionData';

interface RegionAccordionProps {
  onRegionSelect?: (lat: number, lng: number, level: number) => void;
}

// JSP의 REGION_COORDS를 그대로 이식
const REGION_COORDS: Record<
  string,
  { lat: number; lng: number; level: number }
> = {
  '전국 전체': { lat: 36.2683, lng: 127.6358, level: 13 },
  서울특별시: { lat: 37.5665, lng: 126.978, level: 9 },
  부산광역시: { lat: 35.1796, lng: 129.0756, level: 9 },
  대구광역시: { lat: 35.8714, lng: 128.6014, level: 9 },
  인천광역시: { lat: 37.4563, lng: 126.7052, level: 9 },
  광주광역시: { lat: 35.1595, lng: 126.8526, level: 9 },
  대전광역시: { lat: 36.3504, lng: 127.3845, level: 9 },
  울산광역시: { lat: 35.5384, lng: 129.3114, level: 9 },
  세종특별자치시: { lat: 36.48, lng: 127.289, level: 9 },
  경기도: { lat: 37.4138, lng: 127.5183, level: 10 },
  강원도: { lat: 37.8228, lng: 128.1555, level: 10 },
  충청북도: { lat: 36.6357, lng: 127.4912, level: 10 },
  충청남도: { lat: 36.6588, lng: 126.6728, level: 10 },
  전라북도: { lat: 35.8204, lng: 127.1087, level: 10 },
  전라남도: { lat: 34.8679, lng: 126.991, level: 10 },
  경상북도: { lat: 36.576, lng: 128.5056, level: 10 },
  경상남도: { lat: 35.2377, lng: 128.6919, level: 10 },
  제주특별자치도: { lat: 33.489, lng: 126.4983, level: 10 },
};

export default function RegionAccordion({
  onRegionSelect,
}: RegionAccordionProps) {
  const [openRegion, setOpenRegion] = useState<string | null>('전국 전체');
  const [activeRegion, setActiveRegion] = useState<string>('전국 전체');

  // 메인 지역 클릭 (JSP jumpToMainRegion + toggleAccordion 통합)
  const handleMainRegionClick = (regionName: string) => {
    // 아코디언 토글 로직
    setOpenRegion((prev) => (prev === regionName ? null : regionName));
    setActiveRegion(regionName);

    // 좌표 이동 로직
    const coord = REGION_COORDS[regionName];
    if (coord && onRegionSelect) {
      onRegionSelect(coord.lat, coord.lng, coord.level);
    }
  };

  // 세부 지역 클릭 (JSP jumpToSubRegion 이식)
  const handleSubRegionClick = (
    main: string,
    sub: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // 이벤트 버블링 방지

    if (!window.kakao || !window.kakao.maps) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    const address = `${main} ${sub}`;

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const lat = parseFloat(result[0].y);
        const lng = parseFloat(result[0].x);
        if (onRegionSelect) {
          onRegionSelect(lat, lng, 7); // 세부 지역은 줌 레벨 7로 고정
        }
      }
    });
  };

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-std border border-gray-50 flex flex-col">
      {/* 내부 스크롤 영역 (스크롤바 커스텀 클래스 포함) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
        {Object.entries(REGIONS).map(([mainRegion, subRegions]) => {
          const isOpen = openRegion === mainRegion;
          const isActive = activeRegion === mainRegion;

          return (
            <div
              key={mainRegion}
              className="border-b border-gray-50 last:border-none"
            >
              {/* .region-header 스타일 적용 */}
              <div
                className={`flex justify-between items-center px-5 py-4 cursor-pointer transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#f7fcf5] text-[#4A9F2E] font-semibold' // .active 스타일
                      : 'bg-white text-gray-700 hover:bg-[#f7fcf5] hover:text-[#4A9F2E]' // hover 스타일
                  }
                `}
                onClick={() => handleMainRegionClick(mainRegion)}
              >
                <span className="text-[15px]">{mainRegion}</span>
                {mainRegion !== '전국 전체' && (
                  <span
                    className={`text-[6px] text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </span>
                )}
              </div>

              {/* .region-content 스타일 적용 */}
              {isOpen && subRegions.length > 0 && (
                <div className="">
                  <ul className="list-none p-0 m-0">
                    {subRegions.map((sub) => (
                      <li
                        key={sub}
                        className="px-8 py-3 font-caption-01 text-gray-500 cursor-pointer hover:bg-gray-50 hover:text-green-600 transition-colors"
                        onClick={(e) =>
                          handleSubRegionClick(mainRegion, sub, e)
                        }
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
