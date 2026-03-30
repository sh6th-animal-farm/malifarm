import { useEffect, useState } from 'react';

export function useKakaoMap(containerId: string, projects: any[]) {
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!window.kakao) {
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
      script.onload = () => window.kakao.maps.load(() => initMap());
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      const container = document.getElementById(containerId);
      if (!container) return;
      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(36.3504, 127.3845),
        level: 10,
      });
      setMapInstance(map);
    }
  }, [containerId]);

  // 프로젝트 데이터 변경 시 마커 업데이트
  useEffect(() => {
    if (!mapInstance || projects.length === 0) return;
    projects.forEach((p) => {
      if (p.latitude && p.longitude) {
        new window.kakao.maps.Marker({
          map: mapInstance,
          position: new window.kakao.maps.LatLng(p.latitude, p.longitude),
          title: p.projectName,
        });
      }
    });
  }, [mapInstance, projects]);

  return mapInstance;
}
