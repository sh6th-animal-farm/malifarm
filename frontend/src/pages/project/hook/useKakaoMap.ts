import { useEffect, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
    closeKakaoMapOverlay: () => void;
  }
}

// 오버레이 인스턴스 전역 관리 (중복 방지)
let activeOverlay: any = null;

export const useKakaoMap = (containerId: string, projects: any[]) => {
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    // [추가] 전역 닫기 함수: 리액트 컴포넌트 밖의 HTML에서 호출 가능하도록 설정
    window.closeKakaoMapOverlay = () => {
      if (activeOverlay) {
        activeOverlay.setMap(null);
        activeOverlay = null;
      }
    };
  }, []);

  useEffect(() => {
    const script = document.createElement('script');

    // [키 삽입] .env 파일의 VITE_KAKAO_MAP_KEY를 가져옵니다.
    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=clusterer`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(36.2683, 127.6358),
          level: 12,
        };
        const map = new window.kakao.maps.Map(container, options);
        setMapInstance(map);

        // 클러스터러 설정 (styles 포함)
        const clusterer = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minClusterSize: 1,
          minLevel: 1,
          disableClickZoom: true, // 클릭 시 자동 확대 방지 (모달을 띄우기 위해 필수)
          styles: [
            {
              width: '48px',
              height: '48px',
              background: 'rgba(74, 159, 46, 0.9)',
              borderRadius: '50%',
              color: '#fff',
              textAlign: 'center',
              lineHeight: '48px',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            },
          ],
        });

        const markers = projects.map((project) => {
          const position = new window.kakao.maps.LatLng(
            project.latitude,
            project.longitude,
          );
          const marker = new window.kakao.maps.Marker({ position, opacity: 0 });
          (marker as any).projectData = project; // 데이터 바인딩
          return marker;
        });

        clusterer.addMarkers(markers);

        // 클러스터 클릭 이벤트 (1개일 때 모달 노출)
        window.kakao.maps.event.addListener(
          clusterer,
          'clusterclick',
          (cluster: any) => {
            const clusterMarkers = cluster.getMarkers();
            if (clusterMarkers.length === 1) {
              const project = clusterMarkers[0].projectData;
              displayModal(map, project, cluster.getCenter());
            } else {
              map.setLevel(map.getLevel() - 2, { anchor: cluster.getCenter() });
            }
          },
        );

        window.kakao.maps.event.addListener(map, 'dragstart', () =>
          window.closeKakaoMapOverlay(),
        );
      });
    };

    return () => {
      if (script.parentNode) document.head.removeChild(script);
      window.closeKakaoMapOverlay();
    };
  }, [projects, containerId]);

  return mapInstance;
};

function displayModal(map: any, project: any, position: any) {
  if (window.closeKakaoMapOverlay) window.closeKakaoMapOverlay();

  // Button.tsx의 'check' 스타일 (bg-green-600, rounded-12) 완벽 적용
  const content = `
    <div style="position:relative; margin-bottom: 50px; z-index: 100;">
        <div style="padding:24px; background:#fff; border-radius:20px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15); min-width:240px; border: 1px solid #eee; position:relative;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h4 style="margin:0; color:#191919; font-size:17px; font-weight:700;">${project.projectName}</h4>
                <span style="cursor:pointer; color:#707070; font-size:24px; line-height:1; font-weight:300; padding:4px;" 
                      onclick="window.closeKakaoMapOverlay()">×</span>
            </div>
            
            <p style="margin:0 0 16px 0; color:#16a34a; font-weight:700; font-size:15px;">
                예상 수익률: ${project.expectedReturn}%
            </p>
            
            <button onclick="window.location.href='/project/${project.projectId}'" 
                    style="
                        width:100%; height:50px; display:inline-flex; align-items:center; justify-content:center; 
                        background-color:#16a34a; border:1px solid #16a34a; 
                        color:#fff; border-radius:12px; font-weight:600; font-size:15px; cursor:pointer; 
                        transition: all 0.2s;
                    "
                    onmouseover="this.style.backgroundColor='#15803d'"
                    onmouseout="this.style.backgroundColor='#16a34a'">
                상세보기
            </button>
        </div>
        
        <div style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); 
                    width:0; height:0; border-top:10px solid #fff; 
                    border-right:10px solid transparent; border-left:10px solid transparent;">
        </div>
    </div>`;

  activeOverlay = new window.kakao.maps.CustomOverlay({
    content: content,
    position: position,
    xAnchor: 0.5,
    yAnchor: 1.0,
    zIndex: 1000,
  });

  // [수정] 모달이 화면 위로 잘리지 않도록 지도의 중심을 마커보다 더 위로 이동
  const level = map.getLevel();
  let offset = 0.002;
  if (level > 10)
    offset = 0.15; // 지도가 멀면 더 많이 이동
  else if (level > 7) offset = 0.03;

  const moveLatLon = new window.kakao.maps.LatLng(
    position.getLat() + offset,
    position.getLng(),
  );
  map.panTo(moveLatLon);

  activeOverlay.setMap(map);
}
