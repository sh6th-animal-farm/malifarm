import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js'; // 1. registerables 추가
import type { ProjectData } from '@/types/project';
import InfoGrid from './DetailInfoCard';

// 2. 반드시 컴포넌트 외부에서 차트 기능을 등록해야 합니다.
Chart.register(...registerables);

export default function FarmTabContent({ data }: { data: ProjectData }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // 캔버스 엘리먼트가 없거나 데이터가 없으면 실행 안 함
    if (!chartRef.current || !data.temperatureInside) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // 3. [중요] 기존 차트가 있다면 확실하게 파괴 (충돌 방지)
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // 4. 새 차트 생성
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.temperatureInside.map((_, i) => `${i + 9}시`),
        datasets: [{
          label: '내부 기온 (℃)',
          data: data.temperatureInside,
          backgroundColor: '#6CC32D',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
          y: { 
            type: 'linear', // 에러 방지를 위해 명시적 지정
            beginAtZero: false, 
            min: 15, 
            max: 30 
          } 
        }
      }
    });

    // 5. 컴포넌트가 사라질 때(Unmount) 차트 파괴
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data.temperatureInside]); // 데이터가 바뀔 때만 다시 그리기

  return (
    console.log("렌더링 - FarmTabContent"),
    <div className="space-y-[24px]">
      <InfoGrid items={[
        { label: "농장 위치", value: data.farm?.addressSido || "정보 없음" },
        { label: "운영 인원", value: `${data.managerCount}명` },
        { label: "농장 면적", value: `${data.farm?.area?.toLocaleString()}㎡` },
        { label: "재배 방법", value: data.method },
        { label: "운영 계획", value: data.projectDescription, fullWidth: true}
      ]} />
      
      <div className="p-8 bg-white border border-gray-100 rounded-[20px] shadow-std">
        <p className="text-gray-800 mb-6 font-bold text-lg">농장 실시간 기온 추이</p>
        <div className="h-[300px] w-full relative">
          {/* 캔버스 아이디 충돌 방지를 위해 id 속성 제거 또는 유니크하게 유지 */}
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}