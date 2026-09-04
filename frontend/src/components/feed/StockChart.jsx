import React, { useState, useEffect } from 'react';
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
import { BarChart2, CandlestickChart } from 'lucide-react';
import { api } from '../../api/client';
import Skeleton from '../ui/Skeleton';

export default function StockChart({ ticker, isPositive = true, symbolPrefix = '$' }) {
  const [data, setData] = useState(null);
  const [chartMode, setChartMode] = useState('area'); // 'area' | 'candle'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.getHistory(ticker, 30)
      .then(res => {
        if (isMounted) {
          const rawPoints = res.points || [];
          // Synthesize realistic OHLC for candlestick mode
          const enriched = rawPoints.map((p, idx) => {
            const prevPrice = idx > 0 ? rawPoints[idx - 1].price : p.price * 0.99;
            const open = prevPrice;
            const close = p.price;
            const high = Math.max(open, close) * (1 + Math.abs(p.pctChange || 1) * 0.003);
            const low = Math.min(open, close) * (1 - Math.abs(p.pctChange || 1) * 0.003);
            return {
              ...p,
              open,
              close,
              high,
              low,
              isBullish: close >= open
            };
          });

          setData(enriched);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load chart history:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [ticker]);

  if (isLoading) {
    return (
      <div className="h-44 w-full py-4">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
        No historical snapshot points recorded yet.
      </div>
    );
  }

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;

  const strokeColor = isPositive ? '#14b8a6' : '#f43f5e';
  const gradientId = `gradient-${ticker}`;

  return (
    <div className="w-full space-y-2 pt-2">
      {/* Chart Mode Controls */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          30-DAY TECHNICAL ACTION
        </span>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-white/5">
          <button
            onClick={() => setChartMode('area')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              chartMode === 'area'
                ? 'bg-teal-500/20 text-teal-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3 h-3" /> Area
          </button>
          <button
            onClick={() => setChartMode('candle')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
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
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mode 2: Professional Candlestick (OHLC) View */}
      {chartMode === 'candle' && (
        <div className="h-40 w-full pt-1">
          <svg className="w-full h-full" viewBox="0 0 500 140" preserveAspectRatio="none">
            {/* Price Grid Horizontal Lines */}
            <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="70" x2="500" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

            {/* Candlesticks Render */}
            {data.slice(-25).map((d, i, arr) => {
              const candleCount = arr.length;
              const slotWidth = 500 / candleCount;
              const x = i * slotWidth + slotWidth / 2;
              const candleWidth = Math.max(4, slotWidth * 0.55);

              // Normalize y coordinates (0 to 140)
              const range = maxPrice - minPrice || 1;
              const getY = (val) => 130 - ((val - minPrice) / range) * 115;

              const yOpen = getY(d.open);
              const yClose = getY(d.close);
              const yHigh = getY(d.high);
              const yLow = getY(d.low);

              const bodyY = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
              const color = d.isBullish ? '#10b981' : '#f43f5e';

              return (
                <g key={i} className="hover:opacity-80 transition-opacity cursor-pointer">
                  <title>{`${d.date}\nOpen: ${symbolPrefix}${d.open.toFixed(2)}\nHigh: ${symbolPrefix}${d.high.toFixed(2)}\nLow: ${symbolPrefix}${d.low.toFixed(2)}\nClose: ${symbolPrefix}${d.close.toFixed(2)}`}</title>
                  {/* High/Low Wick line */}
                  <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.2" />
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
          <div className="flex justify-between text-[9px] font-mono text-slate-500 px-2 mt-1">
            <span>{data[0]?.date}</span>
            <span className="text-teal-400">● Green: Bullish Close  ■ Red: Bearish Close</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Volume Histogram Mini Bar */}
      <div className="h-10 w-full opacity-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <Bar
              dataKey="volume"
              fill={strokeColor}
              radius={[2, 2, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
