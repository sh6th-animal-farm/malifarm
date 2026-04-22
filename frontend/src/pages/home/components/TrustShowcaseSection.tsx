import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/api/apiClient';

type ProjectSummaryDTO = {
  projectStatus?: string;
  expectedReturn?: number | string | null;
  targetAmount?: number | string | null;
  actualAmount?: number | string | null;
  minAmountPerInvestor?: number | string | null;
};

type DistributionChip = {
  label: string;
  ratio: number;
};

const ACTIVE_STATUSES = new Set(['SUBSCRIPTION', 'ANNOUNCEMENT', 'INPROGRESS']);
const RETURN_BINS = [
  { label: '~5%', min: 0, max: 5 },
  { label: '5~10%', min: 5, max: 10 },
  { label: '10~15%', min: 10, max: 15 },
  { label: '15~20%', min: 15, max: 20 },
  { label: '20%~', min: 20, max: Number.POSITIVE_INFINITY },
];

const EOK_UNIT = 100000000;

export default function TrustShowcaseSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(0);
  const [actualAmount, setActualAmount] = useState(0);
  const [distribution, setDistribution] = useState<DistributionChip[]>([]);
  const [averageReturn, setAverageReturn] = useState(0);
  const [estimatedInvestors, setEstimatedInvestors] = useState(0);

  const [animatedTargetEok, setAnimatedTargetEok] = useState(0);
  const [animatedActualEok, setAnimatedActualEok] = useState(0);
  const [animatedFundingRate, setAnimatedFundingRate] = useState(0);
  const [animatedInvestors, setAnimatedInvestors] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const projects = await apiClient.get<ProjectSummaryDTO[], ProjectSummaryDTO[]>('/api/project/all');
        const activeProjects = projects.filter((project) =>
          ACTIVE_STATUSES.has(String(project.projectStatus ?? '').toUpperCase()),
        );

        const returns = activeProjects
          .map((project) => Number(project.expectedReturn))
          .filter((value) => Number.isFinite(value) && value >= 0);

        const nextTargetAmount = activeProjects.reduce((acc, project) => {
          const value = Number(project.targetAmount ?? 0);
          return acc + (Number.isFinite(value) ? value : 0);
        }, 0);

        const nextActualAmount = activeProjects.reduce((acc, project) => {
          const value = Number(project.actualAmount ?? 0);
          return acc + (Number.isFinite(value) ? value : 0);
        }, 0);

        const nextAverageReturn = returns.length > 0
          ? returns.reduce((acc, value) => acc + value, 0) / returns.length
          : 0;

        const nextEstimatedInvestors = activeProjects.reduce((acc, project) => {
          const actual = Number(project.actualAmount ?? 0);
          const min = Number(project.minAmountPerInvestor ?? 0);
          if (!Number.isFinite(actual) || !Number.isFinite(min) || min <= 0) return acc;
          return acc + Math.floor(actual / min);
        }, 0);

        const nextDistribution = RETURN_BINS.map((bin) => {
          const count = returns.filter((value) => value >= bin.min && value < bin.max).length;
          const ratio = returns.length > 0 ? (count / returns.length) * 100 : 0;
          return { label: bin.label, ratio };
        });

        setProjectCount(activeProjects.length);
        setTargetAmount(nextTargetAmount);
        setActualAmount(nextActualAmount);
        setAverageReturn(nextAverageReturn);
        setEstimatedInvestors(nextEstimatedInvestors);
        setDistribution(nextDistribution);
      } catch (error) {
        console.error('신뢰 지표 데이터 로드 실패', error);
        setProjectCount(0);
        setTargetAmount(0);
        setActualAmount(0);
        setAverageReturn(0);
        setEstimatedInvestors(0);
        setDistribution(RETURN_BINS.map((bin) => ({ label: bin.label, ratio: 0 })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fundingRate = useMemo(() => {
    if (targetAmount <= 0) return 0;
    return Math.min((actualAmount / targetAmount) * 100, 100);
  }, [actualAmount, targetAmount]);

  useEffect(() => {
    if (isLoading) return;

    let rafId = 0;
    const duration = 1300;
    const targetEok = targetAmount / EOK_UNIT;
    const actualEok = actualAmount / EOK_UNIT;
    const startAt = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - startAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setAnimatedTargetEok(targetEok * eased);
      setAnimatedActualEok(actualEok * eased);
      setAnimatedFundingRate(fundingRate * eased);
      setAnimatedInvestors(estimatedInvestors * eased);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isLoading, targetAmount, actualAmount, fundingRate, estimatedInvestors]);

  return (
    <section className="bg-white py-10 md:py-14 lg:py-16">
      <div className="layout-container">
        <article className="mx-auto w-full max-w-[980px] rounded-[20px] border border-gray-100 bg-white px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-5 border-b border-gray-100 pb-6 md:grid-cols-2 md:gap-8">
            <div>
              <p className="font-caption-01 text-gray-500">누적 투자자수</p>
              <p className="mt-1 font-header-03 text-gray-900 md:font-header-01">
                {Math.round(animatedInvestors).toLocaleString()}명
              </p>
              <p className="mt-1 font-bottom-01 text-gray-400">최소 투자금 기준 추정치</p>
            </div>
            <div>
              <p className="font-caption-01 text-gray-500">누적 투자금</p>
              <p className="mt-1 font-header-03 text-gray-900 md:font-header-01">
                {animatedActualEok.toFixed(1)}억
              </p>
              <p className="mt-1 font-bottom-01 text-gray-400">활성 프로젝트 현재 달성금액 기준</p>
            </div>
          </div>

          <h2 className="mt-5 font-header-03 text-gray-900 md:font-header-02">
            모집 {animatedTargetEok.toFixed(1)}억 중 <span className="text-green-700">{animatedActualEok.toFixed(1)}억</span> 달성
          </h2>

          <div className="mt-4 h-[8px] w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-green-600 transition-all duration-500"
              style={{ width: `${animatedFundingRate}%` }}
            />
          </div>

          <p className="mt-3 font-caption-01 text-gray-500">
            {isLoading
              ? '실시간 집계 중...'
              : `실시간 집계 · 활성 프로젝트 ${projectCount}개 · 평균 예상 수익률 연 ${averageReturn.toFixed(1)}%`}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {distribution.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1 rounded-full border border-gray-100 px-2.5 py-1 font-caption-01 text-gray-600"
              >
                <span>{item.label}</span>
                <span className="text-gray-900">{item.ratio.toFixed(0)}%</span>
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
