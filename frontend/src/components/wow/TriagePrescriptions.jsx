import React from 'react';
import { ShieldCheck, AlertTriangle, Zap, Anchor, Target, ArrowUpRight } from 'lucide-react';

export default function TriagePrescriptions({ needsAttention = [], quiet = [] }) {
  if (needsAttention.length === 0 && quiet.length === 0) return null;

  const allItems = [...needsAttention, ...quiet];

  // 1. Highest Volatility Z-score / Overextension
  const highestZItem = [...allItems].sort((a, b) => 
    (b.scoreBreakdown?.relativeMoveZScore || 0) - (a.scoreBreakdown?.relativeMoveZScore || 0)
  )[0];

  // 2. Highest Volume Anomaly Inflow
  const highestVolItem = [...allItems].sort((a, b) => 
    (b.scoreBreakdown?.volumeAnomalyRatio || 1) - (a.scoreBreakdown?.volumeAnomalyRatio || 1)
  )[0];

  // 3. Lowest Beta / Volatility Anchor from Quiet list
  const anchorItem = (quiet.length > 0 ? quiet : allItems).sort((a, b) => 
    (a.scoreBreakdown?.relativeMoveZScore || 0) - (b.scoreBreakdown?.relativeMoveZScore || 0)
  )[0];

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-card border border-teal-500/20 bg-gradient-to-r from-teal-950/20 via-slate-900/60 to-slate-900/80 space-y-3.5 shadow-[0_4px_25px_-5px_rgba(20,184,166,0.15)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <Target className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono uppercase tracking-wide">
              Pulse Triage Action Plan
            </h3>
            <p className="text-[11px] text-slate-400">
              Prescriptive next steps synthesized from today's cross-asset statistical anomalies
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
          DAILY TRADE DESK MEMO
        </span>
      </div>

      {/* 3 Actionable Bullet Prescriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Prescription 1: Extension / Caution */}
        {highestZItem && (
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-400 font-mono font-bold text-[11px]">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                OVEREXTENSION ALERT
              </span>
              <span className="bg-amber-400/10 px-1.5 py-0.5 rounded text-[10px]">{highestZItem.ticker}</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              <strong className="text-amber-300 font-mono">{highestZItem.ticker}</strong> is extended <span className="font-mono text-amber-200">{highestZItem.scoreBreakdown?.relativeMoveZScore}σ</span> from its 30-day mean ({highestZItem.pctChangeDay >= 0 ? '+' : ''}{highestZItem.pctChangeDay}%).
            </p>
            <div className="text-[10px] text-amber-300/80 font-mono border-t border-amber-500/10 pt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Action: Tighten trailing stops; avoid chasing breakout.</span>
            </div>
          </div>
        )}

        {/* Prescription 2: Volume Inflow */}
        {highestVolItem && (
          <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/20 space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-teal-300 font-mono font-bold text-[11px]">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                LIQUIDITY ACCUMULATION
              </span>
              <span className="bg-teal-400/10 px-1.5 py-0.5 rounded text-[10px]">{highestVolItem.ticker}</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              <strong className="text-teal-300 font-mono">{highestVolItem.ticker}</strong> is trading on <span className="font-mono text-teal-200">{highestVolItem.scoreBreakdown?.volumeAnomalyRatio}x</span> normal 30-day volume with firm buying conviction.
            </p>
            <div className="text-[10px] text-teal-300/80 font-mono border-t border-teal-500/10 pt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Action: Primary institutional focus; monitor support levels.</span>
            </div>
          </div>
        )}

        {/* Prescription 3: Defensive Anchor */}
        {anchorItem && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-300 font-mono font-bold text-[11px]">
              <span className="flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                PORTFOLIO ANCHOR
              </span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{anchorItem.ticker}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong className="text-slate-100 font-mono">{anchorItem.ticker}</strong> exhibits lowest volatility variance (<span className="font-mono text-slate-200">{anchorItem.scoreBreakdown?.relativeMoveZScore}σ</span>), serving as a quiet ballast.
            </p>
            <div className="text-[10px] text-slate-400 font-mono border-t border-white/5 pt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Action: Hold steady; dampens total watchlist volatility.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
