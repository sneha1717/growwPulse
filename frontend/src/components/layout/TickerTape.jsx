import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import PulseIndicator from '../feed/PulseIndicator';

export default function TickerTape({ items = [], onSelectTicker }) {
  if (!items || items.length === 0) return null;

  // Duplicate items to ensure seamless infinite scroll
  const tapeItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-[#080B13] border-b border-white/5 overflow-hidden py-1.5 select-none relative z-30 group">
      {/* Subtle edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#080B13] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#080B13] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-ticker-slow group-hover:[animation-play-state:paused] gap-8 items-center">
        {tapeItems.map((item, idx) => {
          const isUp = item.pctChangeDay >= 0;
          return (
            <div
              key={`${item.ticker}-${idx}`}
              onClick={() => onSelectTicker && onSelectTicker(item.ticker)}
              className="flex items-center gap-2.5 px-3 py-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <PulseIndicator timestamp={item.updatedAt} />
              <span className="font-mono font-bold text-xs text-slate-200">
                {item.ticker}
              </span>
              <span className="font-mono text-xs text-slate-300">
                {item.symbolPrefix || '$'}{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
              </span>
              <span className={`font-mono text-[11px] flex items-center gap-0.5 font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? '+' : ''}{typeof item.pctChangeDay === 'number' ? item.pctChangeDay.toFixed(2) : item.pctChangeDay}%
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-teal-300 border border-white/5">
                ★ {item.attentionScore}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
