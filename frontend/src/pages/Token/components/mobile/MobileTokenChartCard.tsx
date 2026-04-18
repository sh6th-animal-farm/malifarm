import ToggleGroup from '@/components/common/ToggleGroup';
import { PriceDown, PriceUp } from '@/components/icon/Icons';
import { useTokenChart } from '@/pages/Token/hooks/useTokenChart';
import type { TokenOhlcv } from '@/types/tokenType';
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';

interface MobileTokenChartCardProps {
  tokenOhlcv: TokenOhlcv;
}

export default function MobileTokenChartCard({
  tokenOhlcv,
}: MobileTokenChartCardProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeUnit, setActiveUnit] = useState('1');
  const [chartHeight, setChartHeight] = useState(340);

  const units = [
    { id: '1', label: '1M' },
    { id: '5', label: '5M' },
    { id: '15', label: '15M' },
    { id: '60', label: '1H' },
  ];

  useEffect(() => {
    const updateChartHeight = () => {
      if (!chartContainerRef.current) return;

      const top = chartContainerRef.current.getBoundingClientRect().top;
      const rootStyle = getComputedStyle(document.documentElement);
      const bottomTabHeight =
        parseFloat(rootStyle.getPropertyValue('--bottom-tabbar-height')) || 0;

      // 차트 시작 지점부터 하단 탭바 위까지 남은 높이를 사용 (최소/최대값 제한)
      const available = window.innerHeight - top - bottomTabHeight - 8;
      setChartHeight(Math.max(0, Math.floor(available)));
    };

    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);

    return () => {
      window.removeEventListener('resize', updateChartHeight);
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: '#ffffff',
        },
      },
      grid: {
        vertLines: { color: '#f8f8f8' },
        horzLines: { color: '#f8f8f8' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
        minimumWidth: 60,
      },
      localization: { locale: 'ko-KR' },
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#d32f2f',
      downColor: '#1976d2',
      borderUpColor: '#d32f2f',
      borderDownColor: '#1976d2',
      wickUpColor: '#d32f2f',
      wickDownColor: '#1976d2',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      lastValueVisible: true,
      priceLineVisible: false,
    });

    volumeSeries.priceScale().applyOptions({
      visible: true,
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    setIsReady(true);

    return () => {
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !chartContainerRef.current) return;

    chartRef.current.applyOptions({
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
    });
  }, [chartHeight]);

  useTokenChart(
    tokenOhlcv.tokenId,
    activeUnit,
    candleSeriesRef,
    volumeSeriesRef,
    isReady,
  );

  return (
    <div className="">
      <div className="pt-4 pb-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="font-header-02 text-gray-900">{tokenOhlcv.tokenName}</h2>
            <p className="font-body-02 text-gray-400">{tokenOhlcv.tickerSymbol}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <div className="flex items-baseline gap-1">
                <span className="font-header-02 text-gray-900">
                  {tokenOhlcv.marketPrice
                    ? tokenOhlcv.marketPrice.toLocaleString()
                    : '0.00'}
                </span>
                <span className="font-caption-02 text-gray-500">KRW</span>
              </div>
              <div className="flex items-center gap-1 pt-2">
                {tokenOhlcv.changeRate > 0 && <PriceUp />}
                {tokenOhlcv.changeRate < 0 && <PriceDown />}
                <span
                  className={`font-body-03 ${
                    tokenOhlcv.changeRate > 0
                      ? 'text-error'
                      : tokenOhlcv.changeRate < 0
                        ? 'text-info'
                        : 'text-gray-900'
                  }`}
                >
                  {tokenOhlcv.changeRate?.toFixed(2) || '0.00'}% 전일대비
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-caption-02 text-gray-500">
              <span className="flex gap-1">
                고가 <b className="text-gray-900">{tokenOhlcv.highPrice?.toLocaleString() || '0.00'}</b>
              </span>
              <span className="flex gap-1">
                저가 <b className="text-gray-900">{tokenOhlcv.lowPrice?.toLocaleString() || '0.00'}</b>
              </span>
              <span className="flex gap-1">
                거래대금{' '}
                <b className="text-gray-900">
                  {tokenOhlcv.dailyTradeVolume?.toLocaleString() || '0.00'}
                </b>
              </span>
            </div>
          </div>

          <div className="w-[182px]">
            <ToggleGroup
              tabs={units}
              activeTab={activeUnit}
              onChange={setActiveUnit}
              height={44}
              fullWidth
            />
          </div>
        </div>
      </div>

      <div className="">
        <div
          ref={chartContainerRef}
          className="w-full [&_a]:hidden"
          style={{ height: `${chartHeight}px` }}
        />
      </div>
    </div>
  );
}
