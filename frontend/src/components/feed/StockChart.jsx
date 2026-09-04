import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { BarChart2, CandlestickChart, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { api } from '../../api/client';
import Skeleton from '../ui/Skeleton';

function generateFallbackCandles(ticker, basePrice = 150, days = 30) {
  const points = [];
  let p = basePrice * 0.94;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const dailyReturn = (Math.random() - 0.48) * 0.028;
    p = parseFloat((p * (1 + dailyReturn)).toFixed(2));
    const dt = new Date(now - i * 86400000);
    const date = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const open = parseFloat((p * (1 - (Math.random() - 0.5) * 0.012)).toFixed(2));
    const close = i === 0 ? basePrice : p;
    const high = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.012)).toFixed(2));
    const low = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.012)).toFixed(2));
    const volume = Math.floor(12000000 + Math.random() * 6000000);

    points.push({
      date,
      timestamp: dt.toISOString(),
      price: close,
      open,
      high,
      low,
      close,
      volume,
      pctChange: parseFloat((dailyReturn * 100).toFixed(2)),
      isBullish: close >= open
    });
  }
  return points;
}

export default function StockChart({ 
  ticker, 
  isPositive = true, 
  symbolPrefix = '$',
  currentPrice = 150,
  pctChange = 0
}) {
  const [data, setData] = useState(null);
  const [chartMode, setChartMode] = useState('area'); // 'area' | 'candle'
  const [timeframe, setTimeframe] = useState('30d'); // '7d' | '15d' | '30d'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.getHistory(ticker, 30)
      .then(res => {
        if (!isMounted) return;
        const rawPoints = (res && (res.points || res.history)) ? (res.points || res.history) : [];
        
        if (Array.isArray(rawPoints) && rawPoints.length > 0) {
          const enriched = rawPoints.map((p, idx) => {
            const price = typeof p.price === 'number' && !isNaN(p.price) 
              ? p.price 
              : (typeof p.close === 'number' ? p.close : currentPrice);
            
            const prevPrice = idx > 0 
              ? (typeof rawPoints[idx - 1].price === 'number' ? rawPoints[idx - 1].price : (rawPoints[idx - 1].close || price))
              : price * 0.99;

            const open = typeof p.open === 'number' ? p.open : prevPrice;
            const close = idx === rawPoints.length - 1 && currentPrice ? currentPrice : (typeof p.close === 'number' ? p.close : price);
            const high = typeof p.high === 'number' ? p.high : Math.max(open, close) * 1.01;
            const low = typeof p.low === 'number' ? p.low : Math.min(open, close) * 0.99;

            return {
              ...p,
              date: p.date || `Day ${idx + 1}`,
              price: close,
              open,
              high,
              low,
              close,
              volume: p.volume || 10000000,
              pctChange: typeof p.pctChange === 'number' ? p.pctChange : 0,
              isBullish: close >= open
            };
          });
          setData(enriched);
        } else {
          setData(generateFallbackCandles(ticker, currentPrice, 30));
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.warn(`[StockChart] History fetch failed for ${ticker}, using generated series:`, err.message);
        if (isMounted) {
          setData(generateFallbackCandles(ticker, currentPrice, 30));
          setIsLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [ticker, currentPrice]);

  // Filter series according to active timeframe
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeframe === '7d') return data.slice(-7);
    if (timeframe === '15d') return data.slice(-15);
    return data;
  }, [data, timeframe]);

  if (isLoading) {
    return (
      <div className="h-44 w-full py-4 min-w-0">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
        Loading historical technical charts...
      </div>
    );
  }

  const prices = filteredData.map(d => d.price).filter(p => typeof p === 'number' && !isNaN(p));
  let minPrice = Math.min(...prices);
  let maxPrice = Math.max(...prices);

  if (!isFinite(minPrice) || !isFinite(maxPrice) || minPrice === maxPrice) {
    minPrice = (currentPrice || 100) * 0.95;
    maxPrice = (currentPrice || 100) * 1.05;
  } else {
    minPrice = parseFloat((minPrice * 0.985).toFixed(2));
    maxPrice = parseFloat((maxPrice * 1.015).toFixed(2));
  }

  const firstPrice = filteredData[0]?.price || minPrice;
  const lastPrice = filteredData[filteredData.length - 1]?.price || maxPrice;
  const periodReturn = parseFloat((((lastPrice - firstPrice) / (firstPrice || 1)) * 100).toFixed(2));
  const isPeriodPositive = periodReturn >= 0;
  const strokeColor = isPeriodPositive ? '#14b8a6' : '#f43f5e';
  const gradientId = `gradient-${ticker}-${timeframe}`;

  return (
    <div className="w-full space-y-2.5 pt-2 min-w-0">
      {/* Chart Top Controls Bar (Timeframes & Style Toggle) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-white/5">
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
              timeframe === '7d' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeframe('15d')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
              timeframe === '15d' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            15D
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
              timeframe === '30d' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            30D
          </button>
        </div>

        {/* Return Stat */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-slate-500">{timeframe.toUpperCase()}:</span>
          <span className={`font-bold flex items-center gap-0.5 ${isPeriodPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPeriodPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPeriodPositive ? '+' : ''}{periodReturn}%
          </span>
        </div>

        {/* Chart Mode Controls */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-white/5">
          <button
            onClick={() => setChartMode('area')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              chartMode === 'area'
                ? 'bg-teal-500/20 text-teal-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3 h-3" /> Area
          </button>
          <button
            onClick={() => setChartMode('candle')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              chartMode === 'candle'
                ? 'bg-teal-500/20 text-teal-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CandlestickChart className="w-3 h-3" /> Candlesticks
          </button>
        </div>
      </div>

      {/* Mode 1: Area Smooth Curve */}
      {chartMode === 'area' && (
        <div className="h-44 w-full min-w-0" style={{ minHeight: '170px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={170}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${symbolPrefix}${val.toFixed(0)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="glass-panel px-3 py-1.5 rounded-lg text-xs shadow-xl border border-white/10 font-mono">
                        <p className="text-slate-400 text-[10px]">{d.date}</p>
                        <p className="font-bold text-slate-100">{symbolPrefix}{d.price.toFixed(2)}</p>
                        <p className={`text-[10px] ${d.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {d.pctChange >= 0 ? '+' : ''}{d.pctChange.toFixed(2)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                isAnimationActive={true}
                animationDuration={750}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mode 2: Professional Candlestick (OHLC) View */}
      {chartMode === 'candle' && (
        <div className="h-44 w-full pt-1 min-w-0" style={{ minHeight: '170px' }}>
          <svg className="w-full h-full" viewBox="0 0 500 140" preserveAspectRatio="none">
            {/* Price Grid Horizontal Lines */}
            <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <line x1="0" y1="70" x2="500" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

            {/* Candlesticks Render */}
            {filteredData.map((d, i, arr) => {
              const candleCount = arr.length;
              const slotWidth = 500 / candleCount;
              const x = i * slotWidth + slotWidth / 2;
              const candleWidth = Math.max(3.5, Math.min(16, slotWidth * 0.58));

              // Normalize y coordinates (0 to 140)
              const range = maxPrice - minPrice || 1;
              const getY = (val) => 125 - ((val - minPrice) / range) * 105;

              const yOpen = getY(d.open);
              const yClose = getY(d.close);
              const yHigh = getY(d.high);
              const yLow = getY(d.low);

              const bodyY = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2.5, Math.abs(yClose - yOpen));
              const color = d.isBullish ? '#10b981' : '#f43f5e';

              return (
                <g key={i} className="hover:opacity-80 transition-opacity cursor-pointer">
                  <title>{`${d.date}\nOpen: ${symbolPrefix}${d.open.toFixed(2)}\nHigh: ${symbolPrefix}${d.high.toFixed(2)}\nLow: ${symbolPrefix}${d.low.toFixed(2)}\nClose: ${symbolPrefix}${d.close.toFixed(2)}`}</title>
                  {/* High/Low Wick line */}
                  <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
                  {/* Open/Close Candle Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyY}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })}
          </svg>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-2 mt-1">
            <span>{filteredData[0]?.date}</span>
            <span className="text-teal-400">● Bullish Candle  ■ Bearish Candle</span>
            <span>{filteredData[filteredData.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Volume Histogram Mini Bar */}
      <div className="h-10 w-full opacity-60 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={40}>
          <BarChart data={filteredData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <Bar
              dataKey="volume"
              fill={strokeColor}
              radius={[2, 2, 0, 0]}
              isAnimationActive={true}
              animationDuration={600}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

