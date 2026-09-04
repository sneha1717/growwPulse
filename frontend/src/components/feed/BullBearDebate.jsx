import React from 'react';
import { Scale, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function BullBearDebate({ ticker, theses }) {
  if (!theses) return null;

  const bullRatio = theses.bullRatio || 65;
  const bearRatio = 100 - bullRatio;

  return (
    <div className="space-y-4 pt-2 animate-fadeIn">
      {/* Header & Sentiment Meter */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-bold text-slate-100 tracking-wide uppercase font-mono">
            Institutional Bull vs. Bear Case Debate
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-emerald-400 font-bold">{bullRatio}% Bullish</span>
          <span className="text-slate-600">|</span>
          <span className="text-rose-400 font-bold">{bearRatio}% Bearish</span>
        </div>
      </div>

      {/* Consensus Ratio Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
        <div
          className="bg-emerald-400 h-full transition-all duration-700"
          style={{ width: `${bullRatio}%` }}
        />
        <div
          className="bg-rose-500 h-full transition-all duration-700"
          style={{ width: `${bearRatio}%` }}
        />
      </div>

      {/* Grid: Bull on Left, Bear on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Bull Box */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>THE BULL CASE</span>
          </div>
          <p className="text-slate-200 leading-relaxed text-[11px]">
            {theses.bull?.thesis}
          </p>
          <div className="space-y-1 pt-1 border-t border-emerald-500/10">
            <span className="text-[10px] font-mono text-emerald-300/80 uppercase block">Key Drivers:</span>
            {theses.bull?.drivers?.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bear Box */}
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>THE BEAR CASE</span>
          </div>
          <p className="text-slate-200 leading-relaxed text-[11px]">
            {theses.bear?.thesis}
          </p>
          <div className="space-y-1 pt-1 border-t border-rose-500/10">
            <span className="text-[10px] font-mono text-rose-300/80 uppercase block">Key Risks:</span>
            {theses.bear?.risks?.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
