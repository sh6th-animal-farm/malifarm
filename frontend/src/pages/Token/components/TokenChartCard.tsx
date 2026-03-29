import { tokenApi } from '@/api/tokenApi';
import ToggleGroup from '@/components/common/ToggleGroup';
import { PriceDown, PriceUp } from '@/components/icon/Icons';
import type { CandleStick, TokenOhlcv } from '@/types/tokenType';
import {
  CandlestickSeries,
  createChart,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';

export default function TokenChartCard({
  tokenOhlcv,
}: {
  tokenOhlcv: TokenOhlcv;
}) {
  const tokenId = tokenOhlcv.tokenId;
  const isPositive = tokenOhlcv.changeRate > 0;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [activeUnit, setActiveUnit] = useState('1');

  const units = [
    { id: '1', label: '1m' },
    { id: '5', label: '5m' },
    { id: '15', label: '15m' },
    { id: '60', label: '1h' },
  ];

  // 1. 차트 초기화 (마운트 시 1회 실행)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { backgroundColor: '#ffffff', textColor: '#333' },
      grid: {
        vertLines: { color: '#f8f8f8' },
        horzLines: { color: '#f8f8f8' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: { borderVisible: false },
      localization: { locale: 'ko-KR' },
      width: chartContainerRef.current.clientWidth,
      height: 350,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#d32f2f', // --color-error
      downColor: '#1976d2', // --color-info
      borderUpColor: '#d32f2f',
      borderDownColor: '#1976d2',
      wickUpColor: '#d32f2f',
      wickDownColor: '#1976d2',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '', // 메인 가격축과 분리
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // 윈도우 리사이즈 대응
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 2. 탭 변경 시 데이터 요청 및 업데이트
  useEffect(() => {
    const fetchChartData = async () => {
      if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

      try {
        const response = await tokenApi.getCandles(tokenId, Number(activeUnit));

        const KST_OFFSET = 9 * 60 * 60; // 한국 시간은 UTC보다 9시간 빠름 (초 단위로 환산)

        const candleData = response.map((d: CandleStick) => ({
          time: (Number(d.candleTime) + KST_OFFSET) as any,
          open: Number(d.openingPrice),
          high: Number(d.highPrice),
          low: Number(d.lowPrice),
          close: Number(d.closingPrice),
        }));

        const volumeData = response.map((d: CandleStick) => ({
          time: (Number(d.candleTime) + KST_OFFSET) as any,
          value: Number(d.tradeVolume || 0),
          color:
            Number(d.closingPrice) >= Number(d.openingPrice)
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(59, 130, 246, 0.3)',
        }));

        candleSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        // 데이터 로드 후 차트 범위를 데이터에 맞게 자동 조정
        chartRef.current?.timeScale().fitContent();
      } catch (error) {
        console.error('차트 데이터 로드 실패:', error);
      }
    };

    fetchChartData();
  }, [tokenId, activeUnit]); // tokenId나 탭이 바뀔 때마다 실행

  return (
    <div className="bg-white border border-gray-100 rounded-[var(--radius-m)] p-6 shadow-std">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-4">
          {/* 토큰 제목부 */}
          <div className="flex items-baseline gap-2">
            <h2 className="font-header-02 text-gray-900">
              {tokenOhlcv.tokenName ?? '-'}
            </h2>
            <p className="font-body-02 text-gray-400">
              {tokenOhlcv.tickerSymbol ?? '-'}
            </p>
          </div>

          {/* 가격 및 요약 정보 */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <div className="flex items-baseline gap-1">
                <span className="font-header-02 text-gray-900">
                  {tokenOhlcv.marketPrice
                    ? tokenOhlcv.marketPrice.toLocaleString()
                    : '0.00'}
                </span>
                <span className="font-caption-02 text-gray-500">KRW</span>
              </div>

              {/* 전일대비 등락률 */}
              <div className="flex items-center gap-1 pt-2">
                {isPositive ? <PriceUp /> : <PriceDown />}
                <span
                  className={`flex font-body-03 ${isPositive ? 'text-error' : 'text-info'}`}
                >
                  {tokenOhlcv.changeRate
                    ? tokenOhlcv.changeRate.toFixed(2)
                    : '0.00'}
                  % 전일대비
                </span>
              </div>
            </div>

            {/* 고가/저가/거래대금 */}
            <div className="flex items-center gap-3 font-caption-02 text-gray-500">
              <span className="flex gap-1">
                고가{' '}
                <b className="text-gray-900">
                  {tokenOhlcv.highPrice
                    ? tokenOhlcv.highPrice.toLocaleString()
                    : '0.00'}
                </b>
              </span>
              <span className="flex gap-1">
                저가{' '}
                <b className="text-gray-900">
                  {tokenOhlcv.lowPrice
                    ? tokenOhlcv.lowPrice.toLocaleString()
                    : '0.00'}
                </b>
              </span>
              <span className="flex gap-1">
                거래대금{' '}
                <b className="text-gray-900">
                  {tokenOhlcv.dailyTradeVolume
                    ? tokenOhlcv.dailyTradeVolume.toLocaleString()
                    : '0.00'}
                </b>
              </span>
            </div>
          </div>
        </div>

        {/* 기간 탭 */}
        <ToggleGroup
          tabs={units}
          activeTab={activeUnit}
          onChange={setActiveUnit}
          width={182}
          height={48}
        />
      </div>

      {/* 차트 영역 컨테이너 */}
      <div ref={chartContainerRef} className="w-full h-[350px] [&_a]:hidden" />
    </div>
  );
}
