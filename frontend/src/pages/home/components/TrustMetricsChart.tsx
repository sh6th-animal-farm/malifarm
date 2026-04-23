import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/api/apiClient';
import clapImage from '@/assets/icons/clap.png';
import Badge from '@/components/common/Badge';

type DistributionBin = {
  label: string;
  min: number;
  max: number;
  count: number;
};

type DistributionRow = DistributionBin & {
  ratio: number;
  color: string;
  isAverageBucket: boolean;
};

type ProjectSummaryDTO = {
  projectStatus?: string;
  expectedReturn?: number | string | null;
  targetAmount?: number | string | null;
  actualAmount?: number | string | null;
};

const BINS: Array<Omit<DistributionBin, 'count'>> = [
  { label: '~5%', min: 0, max: 5 },
  { label: '5~10%', min: 5, max: 10 },
  { label: '10~15%', min: 10, max: 15 },
  { label: '15~20%', min: 15, max: 20 },
  { label: '20%~', min: 20, max: Number.POSITIVE_INFINITY },
];

const BIN_COLORS = [
  'var(--color-green-50)',
  'var(--color-green-100)',
  'var(--color-green-300)',
  'var(--color-green-500)',
  'var(--color-green-700)',
];
const ACTIVE_STATUSES = new Set(['SUBSCRIPTION', 'ANNOUNCEMENT', 'INPROGRESS']);
const EMPTY_DONUT_BACKGROUND = 'conic-gradient(#e5e7eb 0deg 360deg)';

const toSafeNumber = (value: number | string | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildDistribution = (expectedReturns: number[]) => {
  const bins: DistributionBin[] = BINS.map((bin) => ({ ...bin, count: 0 }));
  expectedReturns.forEach((value) => {
    const target = bins.find((bin) => value >= bin.min && value < bin.max);
    if (target) target.count += 1;
  });
  return bins;
};

const buildDonutBackground = (rows: DistributionRow[]) => {
  if (rows.length === 0) return EMPTY_DONUT_BACKGROUND;

  let acc = 0;
  const slices = rows.map((row) => {
    const start = acc;
    acc += (row.ratio / 100) * 360;
    return `${row.color} ${start.toFixed(2)}deg ${acc.toFixed(2)}deg`;
  });
  return `conic-gradient(${slices.join(', ')})`;
};

function DistributionList({ rows, averageText }: { rows: DistributionRow[]; averageText: string }) {
  return (
    <div className="w-full space-y-2.5">
      {rows.map((row) => (
        <div
          key={row.label}
          className={`flex items-center justify-between gap-3 rounded-[var(--radius-m)] bg-gray-50 px-3 py-3 md:px-4 ${
            row.isAverageBucket ? 'border-2 border-green-600' : ''
          }`}
        >
          <div className="inline-flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: row.color }}
              aria-hidden="true"
            />
            <span className="font-body-02 text-gray-700">{row.label}</span>
            {row.isAverageBucket && (
              <span className="inline-flex shrink-0 rounded-full bg-green-600 px-2 py-0.5 font-caption-01 text-white">
                평균 {averageText}
              </span>
            )}
          </div>
          <div className="shrink-0 text-right">
            <strong className="inline-block min-w-[28px] text-right font-body-03 tabular-nums text-gray-900">
              {row.count}
            </strong>
            <span className="ml-1 inline-block min-w-[52px] text-right font-caption-02 tabular-nums text-gray-500">
              ({row.ratio.toFixed(0)}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DistributionDonut({ background, totalCount }: { background: string; totalCount: number }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative h-[min(72vw,20rem)] w-[min(72vw,20rem)] rounded-full"
        style={{ background }}
        aria-label="예상 수익률 분포 도넛 차트"
      >
        <div className="absolute left-1/2 top-1/2 flex h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center">
          <span className="font-caption-01 text-gray-500">전체 프로젝트</span>
          <strong className="font-subtitle-01 text-gray-900 md:font-header-03">{totalCount}</strong>
        </div>
      </div>
    </div>
  );
}

export default function TrustMetricsChart() {
  const [expectedReturns, setExpectedReturns] = useState<number[]>([]);
  const [totalTargetAmount, setTotalTargetAmount] = useState(0);
  const [totalActualAmount, setTotalActualAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedActualAmount, setAnimatedActualAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const projects = await apiClient.get<ProjectSummaryDTO[], ProjectSummaryDTO[]>('/api/project/all');
        const projectList = Array.isArray(projects) ? projects : [];
        const activeProjects = projectList.filter((project) =>
          ACTIVE_STATUSES.has(String(project.projectStatus ?? '').toUpperCase()),
        );

        const values = activeProjects
          .map((project) => toSafeNumber(project.expectedReturn))
          .filter((value) => Number.isFinite(value) && value >= 0);

        const targetSum = activeProjects.reduce((acc, project) => {
          return acc + toSafeNumber(project.targetAmount);
        }, 0);

        const actualSum = activeProjects.reduce((acc, project) => {
          return acc + toSafeNumber(project.actualAmount);
        }, 0);

        setExpectedReturns(values);
        setTotalTargetAmount(targetSum);
        setTotalActualAmount(actualSum);
      } catch (error) {
        console.error('신뢰 지표 로드 실패', error);
        setExpectedReturns([]);
        setTotalTargetAmount(0);
        setTotalActualAmount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const distribution = useMemo(() => {
    return buildDistribution(expectedReturns);
  }, [expectedReturns]);

  const average = useMemo(() => {
    if (expectedReturns.length === 0) return 0;
    const sum = expectedReturns.reduce((acc, cur) => acc + cur, 0);
    return sum / expectedReturns.length;
  }, [expectedReturns]);

  const totalCount = expectedReturns.length;
  const averageBucketLabel = useMemo(
    () => BINS.find((bin) => average >= bin.min && average < bin.max)?.label,
    [average],
  );

  useEffect(() => {
    if (isLoading) return;

    let rafId = 0;
    const duration = 2600;
    const startAt = performance.now();
    const actualAmount = totalActualAmount;
    const easeOutByPower = (t: number, power: number) => 1 - Math.pow(1 - t, power);
    const proximityToTarget = totalTargetAmount > 0 ? Math.min(actualAmount / totalTargetAmount, 1) : 0;
    const actualEasePower = 7 + proximityToTarget * 5.0;

    const tick = (now: number) => {
      const elapsed = now - startAt;
      const progress = Math.min(elapsed / duration, 1);
      const actualEased = easeOutByPower(progress, actualEasePower);

      setAnimatedActualAmount(actualAmount * actualEased);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isLoading, totalTargetAmount, totalActualAmount]);

  const distributionRows = useMemo<DistributionRow[]>(
    () =>
      distribution.map((bin, index) => ({
        ...bin,
        ratio: totalCount === 0 ? 0 : (bin.count / totalCount) * 100,
        color: BIN_COLORS[index],
        isAverageBucket: bin.label === averageBucketLabel,
      })),
    [distribution, totalCount, averageBucketLabel],
  );

  const donutBackground = useMemo(() => buildDonutBackground(distributionRows), [distributionRows]);

  const formatWon = (value: number) => `${Math.round(value).toLocaleString()}원`;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-stretch">
      <div className="h-full rounded-[24px] bg-white p-7 shadow-std">
        <div className="mb-2">
          <strong className="font-header-04 text-gray-900">연간 예상 수익률 분포</strong>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-center">
          <div className="min-w-0">
            <DistributionList rows={distributionRows} averageText={`${average.toFixed(1)}%`} />
          </div>
          <DistributionDonut background={donutBackground} totalCount={totalCount} />
        </div>
      </div>

      <div className="h-full rounded-[24px] bg-white p-6 shadow-std">
        <div className="flex h-full flex-col items-center gap-3 overflow-hidden">
          <div className="w-full px-2 pt-2 text-center">
            <div className="flex justify-center">
              <Badge variant="success" width="auto" height={30}>
                달성 금액 합산
              </Badge>
            </div>
            <p className="mt-1 font-header-02 tabular-nums text-gray-900 md:font-header-01">
              {formatWon(animatedActualAmount)}
            </p>
          </div>

          <div className="relative h-64 overflow-hidden">
            <img
              src={clapImage}
              alt="clap"
              className="block h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
