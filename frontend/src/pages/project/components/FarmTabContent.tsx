import { useEffect, useMemo, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { projectApi } from '@/api/projectApi';
import type {
  FarmEnvChartPoint,
  FarmEnvChartRange,
  ProjectData,
} from '@/types/projectType';
import InfoGrid from './DetailInfoCard';

Chart.register(...registerables);

const RANGE_OPTIONS: Array<{
  value: FarmEnvChartRange;
  label: string;
}> = [
  { value: '24h', label: '24시간' },
  { value: '7d', label: '1주일' },
  { value: '30d', label: '1달' },
];

const getLatestValue = (values: Array<number | null>) =>
  [...values].reverse().find((value) => value != null) ?? null;

const formatMetricValue = (value: number | null, digits = 1) => {
  if (value == null) return '-';

  const rounded = Number(value.toFixed(digits));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(digits);
};

const formatLabelByRange = (value: string, range: FarmEnvChartRange) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  if (range === '24h') {
    return `${String(date.getHours()).padStart(2, '0')}:00`;
  }

  if (range === '7d') {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = String(date.getHours()).padStart(2, '0');
    return `${month}/${day} ${hour}:00`;
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

export default function FarmTabContent({
  data,
  projectId,
}: {
  data: ProjectData;
  projectId: number;
}) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<FarmEnvChartRange>('24h');
  const [envPoints, setEnvPoints] = useState<FarmEnvChartPoint[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchChartData = async () => {
      try {
        const response = await projectApi.getFarmEnvChartData(
          projectId,
          selectedRange,
        );
        if (!mounted) return;
        setEnvPoints(response);
      } catch (error) {
        console.error('농장 환경 차트 데이터 조회 실패:', error);
        if (!mounted) return;
        setEnvPoints([]);
      }
    };

    fetchChartData();

    return () => {
      mounted = false;
    };
  }, [projectId, selectedRange]);

  const chartData = useMemo(() => {
    return {
      pointCount: envPoints.length,
      labels: envPoints.map((point) =>
        formatLabelByRange(point.createdAt, selectedRange),
      ),
      temperatures: envPoints.map((point) =>
        point.temperatureInside != null
          ? Number(point.temperatureInside)
          : null,
      ),
      humidities: envPoints.map((point) =>
        point.humidityInside != null
          ? Math.min(100, Math.max(0, Number(point.humidityInside)))
          : null,
      ),
    };
  }, [envPoints, selectedRange]);

  const latestTemperature = getLatestValue(chartData.temperatures);
  const latestHumidity = getLatestValue(chartData.humidities);

  const chartWidth = Math.max(
    720,
    selectedRange === '24h'
      ? chartData.pointCount * 36
      : selectedRange === '7d'
        ? chartData.pointCount * 52
        : chartData.pointCount * 84,
  );

  useEffect(() => {
    if (!chartRef.current || chartData.pointCount === 0) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const temperatureColor = '#2f7d32';
    const humidityColor = '#2563eb';
    const gridColor = 'rgba(17, 24, 39, 0.08)';
    const textColor = '#6b7280';

    const validTemperatures = chartData.temperatures.filter(
      (value): value is number => value != null,
    );
    const validHumidities = chartData.humidities.filter(
      (value): value is number => value != null,
    );

    const hasTemperature = validTemperatures.length > 0;
    const hasHumidity = validHumidities.length > 0;

    if (!hasTemperature && !hasHumidity) return;

    const datasets = [];

    if (hasTemperature) {
      datasets.push({
        label: '기온',
        data: chartData.temperatures,
        yAxisID: 'temperature',
        borderColor: temperatureColor,
        backgroundColor: `${temperatureColor}18`,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: temperatureColor,
        pointBorderWidth: 2,
        pointStyle: 'circle' as const,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.28,
        fill: false,
        spanGaps: true,
      });
    }

    if (hasHumidity) {
      datasets.push({
        label: '습도',
        data: chartData.humidities,
        yAxisID: 'humidity',
        borderColor: humidityColor,
        backgroundColor: `${humidityColor}18`,
        pointBackgroundColor: humidityColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointStyle: 'triangle' as const,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
        tension: 0.22,
        fill: false,
        spanGaps: true,
      });
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const temperatureMin = hasTemperature ? Math.min(...validTemperatures) : 0;
    const temperatureMax = hasTemperature ? Math.max(...validTemperatures) : 30;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.92)',
            padding: 12,
            cornerRadius: 12,
            displayColors: false,
            callbacks: {
              title: (items) => items[0]?.label ?? '',
              label: (item) => {
                const unit = item.dataset.yAxisID === 'temperature' ? '℃' : '%';
                return `${item.dataset.label} ${formatMetricValue(item.parsed.y)}${unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: textColor,
              autoSkip: true,
              maxTicksLimit: selectedRange === '24h' ? 8 : 10,
              maxRotation: 0,
              minRotation: 0,
              font: {
                size: 11,
              },
            },
            border: {
              display: false,
            },
          },
          temperature: {
            type: 'linear',
            display: hasTemperature,
            position: 'left',
            suggestedMin: Math.max(0, temperatureMin - 2),
            suggestedMax: temperatureMax + 2,
            ticks: {
              color: temperatureColor,
              callback: (value) => `${formatMetricValue(Number(value))}℃`,
              font: {
                size: 11,
              },
            },
            grid: {
              color: gridColor,
            },
            border: {
              display: false,
            },
          },
          humidity: {
            type: 'linear',
            display: hasHumidity,
            position: 'right',
            min: 0,
            max: 100,
            ticks: {
              color: humidityColor,
              callback: (value) => `${formatMetricValue(Number(value))}%`,
              font: {
                size: 11,
              },
            },
            grid: {
              drawOnChartArea: false,
            },
            border: {
              display: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartData, selectedRange]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      const canScrollHorizontally =
        container.scrollWidth > container.clientWidth;
      if (!canScrollHorizontally) return;

      event.preventDefault();
      event.stopPropagation();
      container.scrollLeft += event.deltaY + event.deltaX;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [chartWidth]);

  return (
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

      <section className="overflow-hidden rounded-[20px] border border-[#e7efe3] bg-white shadow-std">
        <div className="border-b border-[#e3eddc] px-6 py-5 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-subtitle-01 text-gray-900">
                농장 환경 모니터링
              </p>
              <p className="mt-1 text-sm text-gray-500">
                기간에 따라 실제 집계된 데이터가 반영됩니다.
              </p>
            </div>

            <div className="inline-flex rounded-full border border-[#dbe8d3] bg-white p-1">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRange(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedRange === option.value
                      ? 'bg-[#e8f4e1] text-[#245b2a]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 md:px-8 md:py-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-[#e3eddc]">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-[#2f7d32] bg-white" />
              기온
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-[#e3eddc]">
              <span
                className="inline-block h-0 w-0 border-l-[7px] border-r-[7px] border-b-[12px] border-l-transparent border-r-transparent border-b-[#2563eb]"
                aria-hidden="true"
              />
              습도
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[16px] bg-white/90 px-4 py-4 ring-1 ring-[#e3eddc]">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full border-2 border-[#2f7d32] bg-white" />
                <span className="text-sm font-medium text-gray-500">
                  농장 실시간 기온
                </span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {`${formatMetricValue(latestTemperature)}℃`}
              </p>
            </div>

            <div className="rounded-[16px] bg-white/90 px-4 py-4 ring-1 ring-[#e3eddc]">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-block h-0 w-0 border-l-[7px] border-r-[7px] border-b-[12px] border-l-transparent border-r-transparent border-b-[#2563eb]"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-gray-500">
                  농장 실시간 습도
                </span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {`${formatMetricValue(latestHumidity)}%`}
              </p>
            </div>
          </div>

          {chartData.pointCount > 0 ? (
            <div
              ref={scrollRef}
              className="overflow-x-auto rounded-[18px] bg-white px-4 py-4 ring-1 ring-[#e3eddc] md:px-5"
            >
              <div
                className="h-[320px]"
                style={{ width: `${chartWidth}px`, minWidth: '100%' }}
              >
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          ) : (
            <div className="flex h-[240px] items-center justify-center rounded-[18px] bg-white text-sm text-gray-400 ring-1 ring-[#e3eddc]">
              표시할 농장 환경 데이터가 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
