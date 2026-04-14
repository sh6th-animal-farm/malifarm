import type { ProjectList } from '@/types/projectType';
import React, { useEffect, useRef } from 'react';

interface Props {
  projects: ProjectList[]; // 백엔드에서 받은 리스트
}

const KakaoMap = ({ projects }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. 카카오맵 스크립트가 로드되었는지 확인
    if (!window.kakao || !window.kakao.maps) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(36.2683, 127.6358),
      level: 12,
    };

    const map = new window.kakao.maps.Map(container, options);

    // 2. 클러스터러 설정 (사용자님의 초록색 디자인 적용)
    const clusterer = new window.kakao.maps.MarkerClusterer({
      map: map,
      averageCenter: true,
      minClusterSize: 1, // 마커 1개여도 초록 동그라미
      styles: [
        {
          width: '48px',
          height: '48px',
          background: 'rgba(74, 159, 46, 0.9)',
          borderRadius: '50%',
          color: '#fff',
          textAlign: 'center',
          lineHeight: '48px',
          fontWeight: 'bold',
        },
      ],
    });

    // 3. 마커 생성 및 추가
    const markers = projects.map((p) => {
      return new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(p.latitude, p.longitude),
      });
    });

    clusterer.addMarkers(markers);
  }, [projects]); // 데이터가 들어오면 지도 다시 그림

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default KakaoMap;
