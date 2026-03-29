import React, { useState } from 'react';
import { REGIONS } from './regionData'; // 위 데이터를 가져옴

interface RegionAccordionProps {
  onRegionSelect?: (lat: number, lng: number, level: number) => void;
}

// 기존 JSP에서 사용하던 좌표 상수 (예시)
const REGION_COORDS: Record<
  string,
  { lat: number; lng: number; level: number }
> = {
  '전국 전체': { lat: 36.3504, lng: 127.3845, level: 10 },
  서울특별시: { lat: 37.5665, lng: 126.978, level: 8 },
  // ... 나머지 시/도 좌표 추가
};

export default function RegionAccordion({
  onRegionSelect,
}: RegionAccordionProps) {
  const [openRegion, setOpenRegion] = useState<string | null>('전국 전체');
  const [activeRegion, setActiveRegion] = useState<string>('전국 전체');

  // 메인 지역 클릭 (이동)
  const handleMainRegionClick = (regionName: string) => {
    setOpenRegion((prev) => (prev === regionName ? null : regionName));
    setActiveRegion(regionName);

    // 좌표 정보가 있다면 이동
    const coord = REGION_COORDS[regionName];
    if (coord && onRegionSelect) {
      onRegionSelect(coord.lat, coord.lng, coord.level);
    }
  };

  // 세부 지역 클릭 (Geocoder 사용)
  const handleSubRegionClick = (
    main: string,
    sub: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    if (!window.kakao || !window.kakao.maps) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    const address = `${main} ${sub}`;

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const lat = parseFloat(result[0].y);
        const lng = parseFloat(result[0].x);
        if (onRegionSelect) {
          onRegionSelect(lat, lng, 7); // 세부지역은 레벨 7로 확대
        }
      }
    });
  };

  return (
    <div className="w-full h-full bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        {Object.entries(REGIONS).map(([mainRegion, subRegions]) => {
          const isOpen = openRegion === mainRegion;
          const isActive = activeRegion === mainRegion;

          return (
            <div
              key={mainRegion}
              className="border-bottom border-gray-50 last:border-none"
            >
              {/* 지역 헤더 */}
              <div
                className={`flex justify-between items-center px-5 py-4 cursor-pointer transition-all duration-200
                  ${isActive ? 'bg-green-50 text-green-600 font-bold' : 'bg-white text-gray-700 hover:bg-green-50/50 hover:text-green-600'}
                `}
                onClick={() => handleMainRegionClick(mainRegion)}
              >
                <span className="text-[15px]">{mainRegion}</span>
                {mainRegion !== '전국 전체' && (
                  <span
                    className={`text-[10px] transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </span>
                )}
              </div>

              {/* 세부 지역 리스트 (애니메이션 적용 가능) */}
              {isOpen && subRegions.length > 0 && (
                <div className="bg-gray-50 py-2">
                  <ul>
                    {subRegions.map((sub) => (
                      <li
                        key={sub}
                        className="px-10 py-2.5 text-[14px] text-gray-500 cursor-pointer hover:bg-gray-100 hover:text-green-600 transition-colors"
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
