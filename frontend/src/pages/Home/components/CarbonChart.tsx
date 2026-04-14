import { kocPoints } from '@/pages/Home/data/data';

function CarbonChart() {
  const maxValue = Math.max(...kocPoints.map((point) => point.value));
  const minValue = Math.min(...kocPoints.map((point) => point.value));
  const range = maxValue - minValue || 1;

  const points = kocPoints
    .map((point, index) => {
      const x = (index / (kocPoints.length - 1)) * 100;
      const y = 90 - ((point.value - minValue) / range) * 60;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex min-h-[320px] flex-col justify-between rounded-[24px] bg-white p-6 shadow-std">
      <svg
        viewBox="0 0 100 100"
        className="h-[240px] w-full"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="#4a9f2e"
          strokeWidth="2.5"
        />
        <polyline
          points={`0,100 ${points} 100,100`}
          fill="rgba(74, 159, 46, 0.12)"
          stroke="none"
        />
        {kocPoints.map((point, index) => {
          const x = (index / (kocPoints.length - 1)) * 100;
          const y = 90 - ((point.value - minValue) / range) * 60;
          return (
            <g key={point.month}>
              <circle cx={x} cy={y} r="2.2" fill="#4a9f2e" />
              <text
                x={x}
                y="98"
                textAnchor="middle"
                style={{ fill: '#9ca3af', fontSize: '3.4px' }}
              >
                {point.month}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between gap-4 text-sm text-gray-500">
        <strong className="text-gray-900">KOC 거래가</strong>
        <span>최근 6개월 기준 우상향 추세</span>
      </div>
    </div>
  );
}

export default CarbonChart;
