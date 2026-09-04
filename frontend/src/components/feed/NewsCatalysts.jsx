import React from 'react';
import { Newspaper, Star, Sparkles, ExternalLink } from 'lucide-react';

export default function NewsCatalysts({ ticker, catalysts = [] }) {
  if (!catalysts || catalysts.length === 0) return null;

  const getTagColor = (tag) => {
    if (tag.includes('Bullish') || tag.includes('Demand') || tag.includes('Breakout') || tag.includes('Hypergrowth')) {
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
    if (tag.includes('Supply') || tag.includes('Cloud') || tag.includes('L2') || tag.includes('Product')) {
      return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    }
    if (tag.includes('Options') || tag.includes('Regulatory') || tag.includes('AI') || tag.includes('Custody')) {
      return 'bg-violet-500/10 text-violet-300 border-violet-500/30';
    }
    return 'bg-slate-800 text-slate-300 border-white/10';
  };

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-1.5 text-teal-400 font-bold">
          <Newspaper className="w-3.5 h-3.5" /> Market Catalysts & Intelligence
        </span>
        <span className="text-[10px] text-slate-500">Curated Drivers</span>
      </div>

      <div className="space-y-2">
        {catalysts.map((cat, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all text-xs space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getTagColor(cat.tag)}`}>
                {cat.tag}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center text-amber-400">
                  {[...Array(cat.impact || 3)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-current" />
                  ))}
                </span>
                <span>•</span>
                <span>{cat.time}</span>
              </div>
            </div>

            <p className="text-slate-200 text-xs font-medium leading-snug">
              {cat.headline}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
