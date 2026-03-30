import { tokenApi } from '@/api/tokenApi';
import Badge from '@/components/common/Badge';
import { PriceUp, PriceDown } from '@/components/icon/Icons';
import type { TokenOhlcv } from '@/types/tokenType';
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';

export default function TokenSummaryCard({ tokenId }: { tokenId: number }) {
  // 1. OHLCV 데이터와 차트 데이터를 내부 상태로 관리
  const [tokenInfo, setTokenInfo] = useState<TokenOhlcv | null>(null); // 토큰 OHLCV 정보
  const chartContainerRef = useRef<HTMLDivElement>(null); // 차트 컨테이너
  const chartRef = useRef<IChartApi | null>(null); // 차트 인스턴스
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null); // 차트 시리즈 (캔들스틱)

  const formatNum = (num: number) => new Intl.NumberFormat().format(num);

  const isPlus = tokenInfo?.changeRate && tokenInfo.changeRate > 0;

  // 2. 차트 초기화 (마운트 시 딱 한 번만)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 차트 생성
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 180,
      layout: { background: { color: 'transparent' }, textColor: '#999' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false, borderVisible: false },
      timeScale: { borderVisible: false, visible: false },
      handleScroll: false,
      handleScale: false,
    });

    // 캔들스틱 시리즈 생성
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#d32f2f', // --color-error
      downColor: '#1976d2', // --color-info
      borderUpColor: '#d32f2f',
      borderDownColor: '#1976d2',
      wickUpColor: '#d32f2f',
      wickDownColor: '#1976d2',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => chart.remove(); // 컴포넌트 언마운트 시 차트 제거 (메모리 누수 방지)
  }, []);

  // 3. tokenId가 바뀔 때마다 토큰 OHLCV 정보와 차트 데이터 fetch
  useEffect(() => {
    if (!tokenId) return;

    const loadData = async () => {
      try {
        // 토큰 OHLCV 정보와 캔들 데이터를 병렬로 호출 (속도 향상)
        const [infoData, candleData] = await Promise.all([
          tokenApi.getOhlcv(tokenId),
          tokenApi.getCandles(tokenId, 1),
        ]);

        // OHLCV 정보 업데이트
        setTokenInfo(infoData);

        // 캔들 데이터 업데이트
        if (seriesRef.current && candleData.length > 0) {
          const formatted = candleData.map((d) => ({
            time: Number(d.candleTime) / 1000,
            open: Number(d.openingPrice),
            high: Number(d.highPrice),
            low: Number(d.lowPrice),
            close: Number(d.closingPrice),
          }));
          seriesRef.current.setData(formatted);
          chartRef.current?.timeScale().fitContent();
        }
      } catch (e) {
        console.error('데이터 로드 실패', e);
      }
    };

    loadData();
  }, [tokenId]);

  return (
    <div className="w-[432px] h-[468px] bg-white border border-gray-100 rounded-[var(--radius-m)] p-6 shadow-std tracking-tight">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-subtitle-01 text-gray-900 mb-1">
            {tokenInfo?.tickerSymbol}
          </h3>
          <p className="font-body-02 text-gray-600">{tokenInfo?.tokenName}</p>
        </div>
        <div className="text-right">
          <div className="font-subtitle-01 text-gray-900">
            {formatNum(tokenInfo?.marketPrice || 0)}
          </div>
          <div
            className={`flex items-center mt-1 gap-1 font-body-03 ${isPlus ? 'text-error' : 'text-info'}`}
          >
            {isPlus ? <PriceUp /> : <PriceDown />}
            {tokenInfo?.changeRate ? tokenInfo.changeRate.toFixed(2) : '0.00'}%
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
            {formatNum(tokenInfo?.openPrice || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-caption-01 text-gray-400">고가</span>
          <span className="font-caption-02 text-gray-900">
            {formatNum(tokenInfo?.highPrice || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-caption-01 text-gray-400">저가</span>
          <span className="font-caption-02 text-gray-900">
            {formatNum(tokenInfo?.lowPrice || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-caption-01 text-gray-400">거래대금</span>
          <span className="font-caption-02 text-gray-900">
            {formatNum(tokenInfo?.dailyTradeVolume || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
