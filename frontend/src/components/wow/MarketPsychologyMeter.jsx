import React from 'react';
import { Compass, Flame, ShieldAlert, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

export default function MarketPsychologyMeter({ items = [] }) {
  if (!items || items.length === 0) return null;

  // Compute market sentiment psychology index (0 - 100)
  const avgPctChange = items.reduce((acc, it) => acc + (it.pctChangeDay || 0), 0) / items.length;
  const maxZScore = Math.max(...items.map(it => it.scoreBreakdown?.relativeMoveZScore || 0));
  const avgAttention = items.reduce((acc, it) => acc + (it.attentionScore || 0), 0) / items.length;

  let score = 50; // default baseline complacency
  if (avgPctChange >= 0) {
    score = Math.min(95, Math.round(50 + avgPctChange * 6 + avgAttention * 3 + maxZScore * 4));
  } else {
    score = Math.max(8, Math.round(50 + avgPctChange * 7 - avgAttention * 2 - maxZScore * 3));
  }

  // Bracket categorization
  let bracket = {
    label: 'Quiet Complacency',
    sublabel: 'Low Volatility / Normal Range',
    color: 'text-slate-300',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    accentColor: '#94a3b8',
    icon: Compass,
    advice: 'Trading conditions are balanced. No extreme positioning bias observed across your basket.'
  };

  if (score <= 25) {
    bracket = {
      label: 'Extreme Fear & Capitulation',
      sublabel: 'Oversold / Value Accumulation Zone',
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/30',
      accentColor: '#38bdf8',
      icon: ShieldAlert,
      advice: 'Panic selling or elevated volatility detected. Institutional value buyers typically look for accumulation entries.'
    };
  } else if (score >= 26 && score <= 50) {
    bracket = {
      label: 'Quiet Complacency',
      sublabel: 'Selective Trading / Range-Bound',
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
      accentColor: '#2dd4bf',
      icon: Compass,
      advice: 'Most constituents trading within normal 1-sigma standard deviation bands. Noise levels are subdued.'
    };
  } else if (score >= 51 && score <= 75) {
    bracket = {
      label: 'Momentum Inflow',
      sublabel: 'Bullish Participation / Breakout Mode',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      accentColor: '#34d399',
      icon: TrendingUp,
      advice: 'Elevated volume anomalies and positive level-crossings confirm steady institutional liquidity accumulation.'
    };
  } else {
    bracket = {
      label: 'Extreme FOMO & Euphoria',
      sublabel: 'Overextended / Profit-Taking Risk',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      accentColor: '#f59e0b',
      icon: Flame,
      advice: 'High-beta leaders are trading >2.5σ above trailing mean. Trailing stops and risk management are warranted.'
    };
  }

  const Icon = bracket.icon;

  return (
    <div className={`p-4 rounded-2xl glass-card border ${bracket.borderColor} space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${bracket.bgColor}`}>
            <Icon className={`w-4 h-4 ${bracket.color}`} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 tracking-wide uppercase font-mono">
              Retail FOMO vs. Panic Index
            </h4>
            <span className="text-[10px] text-slate-400">
              Cross-Asset Psychological State
            </span>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className={`text-lg font-black ${bracket.color}`}>
            {score}<span className="text-xs text-slate-500 font-normal">/100</span>
          </div>
          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${bracket.bgColor} ${bracket.color}`}>
            {bracket.label}
          </span>
        </div>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="space-y-1">
        <div className="w-full h-2 rounded-full bg-slate-800/80 p-0.5 flex gap-1 relative overflow-hidden">
          <div className="h-full flex-1 rounded-l-full bg-sky-500/40" title="0-25: Extreme Fear" />
          <div className="h-full flex-1 bg-teal-500/40" title="26-50: Complacency" />
          <div className="h-full flex-1 bg-emerald-500/40" title="51-75: Momentum" />
          <div className="h-full flex-1 rounded-r-full bg-amber-500/40" title="76-100: Extreme FOMO" />

          {/* Pointer indicator */}
          <div
            className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_8px_#ffffff] -translate-x-1/2 transition-all duration-700"
            style={{ left: `${score}%` }}
          />
        </div>

        <div className="flex justify-between text-[9px] font-mono text-slate-500">
          <span className="text-sky-400">Extreme Fear</span>
          <span>Complacent</span>
          <span>Momentum</span>
          <span className="text-amber-400">Extreme FOMO</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
        {bracket.advice}
      </p>
    </div>
  );
}
