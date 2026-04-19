import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js'; // 1. registerables 추가
import type { ProjectData } from '@/types/projectType';
import InfoGrid from './DetailInfoCard';

// 2. 반드시 컴포넌트 외부에서 차트 기능을 등록해야 합니다.
Chart.register(...registerables);

export default function FarmTabContent({ data }: { data: ProjectData }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const humidityChartRef = useRef<HTMLCanvasElement>(null);
  const humidityChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.temperatureInside) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const now = new Date();
    const currentHour = now.getHours();
    const chartData = data.temperatureInside;
    const labels = chartData.map((_, i) => {
      const hour = (currentHour - (chartData.length - 1 - i) + 24) % 24;
      return `${hour}시`;
    });

    const getCol = (colorName: string) =>
      getComputedStyle(document.documentElement)
        .getPropertyValue(colorName)
        .trim();

    const backgroundColors = chartData.map((_, i) =>
      i === chartData.length - 1
        ? getCol('--color-green-600')
        : getCol('--color-green-300'),
    );

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '내부 기온 (℃)',
            data: chartData,
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 10, max: 35 },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data.temperatureInside]);

  useEffect(() => {
    if (!humidityChartRef.current || !data.humidityInside) return;

    const ctx = humidityChartRef.current.getContext('2d');
    if (!ctx) return;

    const now = new Date();
    const currentHour = now.getHours();

    if (humidityChartInstance.current) {
      humidityChartInstance.current.destroy();
    }

    const chartData = data.humidityInside;

    const labels = chartData.map((_, i) => {
      const hour = (currentHour - (chartData.length - 1 - i) + 24) % 24;
      return `${hour}시`;
    });

    const backgroundColors = chartData.map((_, i) =>
      i === chartData.length - 1 ? '#3498db' : '#85C1E9',
    );

    humidityChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '내부 습도 (%)',
            data: chartData,
            backgroundColor: backgroundColors,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            beginAtZero: false,
            min: 0,
            max: 100,
            ticks: {
              stepSize: 5,
            },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (humidityChartInstance.current) {
        humidityChartInstance.current.destroy();
        humidityChartInstance.current = null;
      }
    };
  }, [data.humidityInside]);

  return (
    console.log('렌더링 - FarmTabContent'),
    (
      <div className="space-y-[24px]">
        <InfoGrid
          items={[
            {
              label: '농장 위치',
              value: data.farm?.addressSido || '정보 없음',
            },
            { label: '운영 인원', value: `${data.managerCount}명` },
            {
              label: '농장 면적',
              value: `${data.farm?.area?.toLocaleString()}㎡`,
            },
            { label: '재배 방법', value: data.method },
            {
              label: '운영 계획',
              value: data.projectDescription,
              fullWidth: true,
            },
          ]}
        />

        <div className="p-8 bg-white border border-gray-100 rounded-[20px] shadow-std">
          <p className="text-gray-800 mb-6 font-bold text-lg">
            농장 실시간 기온 추이
          </p>
          <div className="h-[300px] w-full relative">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className="p-8 bg-white border border-gray-100 rounded-[20px] shadow-std">
          <p className="text-gray-800 mb-6 font-bold text-lg">
            농장 실시간 습도 추이
          </p>
          <div className="h-[300px] w-full relative">
            <canvas ref={humidityChartRef}></canvas>
          </div>
        </div>
      </div>
    )
  );
}
