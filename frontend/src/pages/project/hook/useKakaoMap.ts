import { useEffect, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
    closeKakaoMapOverlay: () => void;
    navigateToProjectDetail: (projectId: number) => void;
  }
}

type MapProject = {
  projectId: number;
  projectName: string;
  projectStatus: string;
  expectedReturn: number;
  latitude: number;
  longitude: number;
};

let activeOverlay: any = null;

export const useKakaoMap = (containerId: string, projects: MapProject[]) => {
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    window.closeKakaoMapOverlay = () => {
      if (activeOverlay) {
        activeOverlay.setMap(null);
        activeOverlay = null;
      }
    };

    window.navigateToProjectDetail = (projectId: number) => {
      window.location.href = `/project/${projectId}`;
    };
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=clusterer`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(36.2683, 127.6358),
          level: 12,
        });
        setMapInstance(map);

        const clusterer = new window.kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minClusterSize: 1,
          minLevel: 1,
          disableClickZoom: true,
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
          (marker as any).projectData = project;
          return marker;
        });

        clusterer.addMarkers(markers);

        window.kakao.maps.event.addListener(
          clusterer,
          'clusterclick',
          (cluster: any) => {
            const clusterMarkers = cluster.getMarkers();
            const clusterProjects = clusterMarkers.map(
              (marker: any) => marker.projectData as MapProject,
            );

            if (
              clusterProjects.length === 1 ||
              hasSameCoordinates(clusterProjects)
            ) {
              displayOverlay(map, clusterProjects, cluster.getCenter());
              return;
            }

            map.setLevel(map.getLevel() - 2, { anchor: cluster.getCenter() });
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

function hasSameCoordinates(projects: MapProject[]) {
  if (projects.length <= 1) return true;

  const { latitude, longitude } = projects[0];
  return projects.every(
    (project) =>
      project.latitude === latitude && project.longitude === longitude,
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getOverlayOffset(level: number, projectCount: number) {
  const extraOffset = Math.max(0, projectCount - 1) * 0.035;

  if (level > 10) return 0.18 + extraOffset;
  if (level > 7) return 0.05 + extraOffset * 0.45;
  return 0.006 + extraOffset * 0.14;
}

function getProjectStatusStyle(projectStatus: string) {
  switch (projectStatus) {
    case 'ANNOUNCEMENT':
      return {
        label: '공고중',
        backgroundColor: 'var(--color-info-light)',
        color: 'var(--color-info)',
      };
    case 'SUBSCRIPTION':
      return {
        label: '청약중',
        backgroundColor: 'var(--color-warning-light)',
        color: 'var(--color-warning)',
      };
    default:
      return {
        label: '진행중',
        backgroundColor: 'var(--color-success-light)',
        color: 'var(--color-success)',
      };
  }
}

function displayOverlay(map: any, projects: MapProject[], position: any) {
  window.closeKakaoMapOverlay?.();

  const itemsMarkup = projects
    .map((project, index) => {
      const statusStyle = getProjectStatusStyle(project.projectStatus);

      return `
        <div style="${index > 0 ? 'border-top:1px solid #f1f5f9; padding-top:16px; margin-top:16px;' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px;">
            <div>
              <h4 style="margin:0 0 6px 0; color:#191919; font-size:16px; font-weight:700;">${escapeHtml(project.projectName)}</h4>
              <p style="margin:0; color:#16a34a; font-weight:700; font-size:14px;">예상 수익률 ${project.expectedReturn}%</p>
            </div>
            <span style="display:inline-flex; align-items:center; justify-content:center; min-width:32px; height:32px; padding:0 10px; background:${statusStyle.backgroundColor}; color:${statusStyle.color}; border-radius:999px; font-size:12px; font-weight:700; white-space:nowrap;">
              ${statusStyle.label}
            </span>
          </div>
          <button
            onclick="window.navigateToProjectDetail(${project.projectId})"
            style="width:100%; height:46px; display:inline-flex; align-items:center; justify-content:center; background-color:#16a34a; border:1px solid #16a34a; color:#fff; border-radius:12px; font-weight:600; font-size:14px; cursor:pointer; transition:all 0.2s;"
            onmouseover="this.style.backgroundColor='#15803d'"
            onmouseout="this.style.backgroundColor='#16a34a'"
          >
            상세보기
          </button>
        </div>`;
    })
    .join('');

  const title =
    projects.length > 1
      ? `같은 위치 프로젝트 ${projects.length}개`
      : '프로젝트 정보';

  const content = `
    <div style="position:relative; margin-bottom:18px; z-index:100;">
      <div style="padding:24px; background:#fff; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.15); min-width:280px; max-width:320px; border:1px solid #eee; position:relative;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; color:#191919; font-size:17px; font-weight:700;">${title}</h4>
          <span
            style="cursor:pointer; color:#707070; font-size:24px; line-height:1; font-weight:300; padding:4px;"
            onclick="window.closeKakaoMapOverlay()"
          >
            ×
          </span>
        </div>
        <div style="max-height:280px; overflow-y:auto; padding-right:4px;">
          ${itemsMarkup}
        </div>
      </div>
      <div style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); width:0; height:0; border-top:10px solid #fff; border-right:10px solid transparent; border-left:10px solid transparent;"></div>
    </div>`;

  activeOverlay = new window.kakao.maps.CustomOverlay({
    content,
    position,
    xAnchor: 0.5,
    yAnchor: 0.92,
    zIndex: 1000,
  });

  const moveLatLon = new window.kakao.maps.LatLng(
    position.getLat() + getOverlayOffset(map.getLevel(), projects.length),
    position.getLng(),
  );

  map.panTo(moveLatLon);
  activeOverlay.setMap(map);
}
