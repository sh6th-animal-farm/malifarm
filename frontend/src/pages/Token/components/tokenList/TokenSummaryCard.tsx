import Badge from '@/components/common/Badge';
import { PriceUp, PriceDown } from '@/components/icon/Icons';
import { useTokenChart } from '@/pages/Token/hooks/useTokenChart';
import { useTokenOhlcv } from '@/pages/Token/hooks/useTokenOhlcv';
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';

export default function TokenSummaryCard({ tokenId }: { tokenId: number }) {
  const chartContainerRef = useRef<HTMLDivElement>(null); // 차트 컨테이너
  const chartRef = useRef<IChartApi | null>(null); // 차트 인스턴스
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null); // 차트 시리즈 (캔들스틱)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null); // 거래량 시리즈
  const [isReady, setIsReady] = useState(false); // 차트 객체 생성 완료 여부
  const { tokenOhlcv } = useTokenOhlcv(tokenId);

  const formatNum = (num: number) => new Intl.NumberFormat().format(num);

  useTokenChart(tokenId, '1', candleSeriesRef, volumeSeriesRef, isReady);

  // 차트 초기화 (마운트 시 딱 한 번만)
  useEffect(() => {
    if (!chartContainerRef.current) {
      console.error('차트 컨테이너를 찾을 수 없습니다.');
      return;
    }

    // 차트 생성
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 382,
      height: chartContainerRef.current.clientHeight || 180,
      layout: { background: { color: 'transparent' }, textColor: '#999' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false, borderVisible: false },
      timeScale: { borderVisible: false, visible: false },
      handleScroll: false,
      handleScale: false,
    });

    // 캔들스틱 시리즈 생성
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#d32f2f', // --color-error
      downColor: '#1976d2', // --color-info
      borderUpColor: '#d32f2f',
      borderDownColor: '#1976d2',
      wickUpColor: '#d32f2f',
      wickDownColor: '#1976d2',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    setIsReady(true); // 차트 생성 완료 후 리렌더링

    return () => chart.remove(); // 컴포넌트 언마운트 시 차트 제거 (메모리 누수 방지)
  }, [tokenId]);

  return (
    <div className="w-[432px] h-[468px] bg-white border border-gray-100 rounded-[var(--radius-m)] p-6 shadow-std tracking-tight">
      {!tokenOhlcv && <div>차트 데이터를 불러오는 중입니다.</div>}
      <div className={!tokenOhlcv ? 'hidden' : 'block'}>
        {/* 헤더 */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-subtitle-01 text-gray-900 mb-1">
              {tokenOhlcv?.tickerSymbol}
            </h3>
            <p className="font-body-02 text-gray-600">
              {tokenOhlcv?.tokenName}
            </p>
          </div>
          <div className="text-right">
            <div className="font-subtitle-01 text-gray-900">
              {formatNum(tokenOhlcv?.marketPrice || 0)}
            </div>
            <div className="flex gap-1 pt-2 text-right">
              {tokenOhlcv?.changeRate > 0 && <PriceUp />}
              {tokenOhlcv?.changeRate < 0 && <PriceDown />}
              <span
                className={`
                    font-body-03
                  ${
                    tokenOhlcv?.changeRate > 0
                      ? 'text-error'
                      : tokenOhlcv?.changeRate < 0
                        ? 'text-info'
                        : 'text-gray-900'
                  }
                `}
              >
                {tokenOhlcv?.changeRate?.toFixed(2) || '0.00'}% 전일대비
              </span>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-100 my-4" />

        {/* 차트 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Badge children="1분봉" />
            <span className="font-caption-01 text-gray-400">최근 1시간</span>
          </div>
          <div ref={chartContainerRef} className="w-full h-full [&_a]:hidden" />
        </div>

        <div className="h-[1px] bg-gray-100 my-4" />

        {/* OHLCV */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-3 pt-4 font-body-02">
          <div className="flex justify-between items-center">
            <span className="font-caption-01 text-gray-400">시가</span>
            <span className="font-caption-02 text-gray-900">
              {formatNum(tokenOhlcv?.openPrice || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-caption-01 text-gray-400">고가</span>
            <span className="font-caption-02 text-gray-900">
              {formatNum(tokenOhlcv?.highPrice || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-caption-01 text-gray-400">저가</span>
            <span className="font-caption-02 text-gray-900">
              {formatNum(tokenOhlcv?.lowPrice || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-caption-01 text-gray-400">거래대금</span>
            <span className="font-caption-02 text-gray-900">
              {formatNum(tokenOhlcv?.dailyTradeVolume || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
