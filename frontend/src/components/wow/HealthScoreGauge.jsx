import React from 'react';
import { Shield, Activity, Layers, Zap } from 'lucide-react';

export default function HealthScoreGauge({ health }) {
  if (!health) return null;

  const score = health.score || 75;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val) => {
    if (val >= 80) return '#14b8a6'; // Teal
    if (val >= 60) return '#38bdf8'; // Sky
    if (val >= 40) return '#f59e0b'; // Amber
    return '#f43f5e';               // Rose
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-semibold text-slate-100">Watchlist Health Index</h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-500/20">
          {health.riskLevel}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Radial SVG Gauge */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={scoreColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black font-mono text-slate-100 leading-none">
              {score}
            </span>
            <span className="text-[9px] font-mono text-slate-400 mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-teal-400" /> Volatility Stability
              </span>
              <span className="font-mono text-slate-300">{health.metrics?.volatility || 70}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${health.metrics?.volatility || 70}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-violet-400" /> Diversification
              </span>
              <span className="font-mono text-slate-300">{health.metrics?.diversification || 60}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-400 rounded-full transition-all duration-700"
                style={{ width: `${health.metrics?.diversification || 60}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> Momentum Balance
              </span>
              <span className="font-mono text-slate-300">{health.metrics?.momentum || 75}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${health.metrics?.momentum || 75}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
