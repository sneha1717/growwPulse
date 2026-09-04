import React from 'react';
import { Plus, Sparkles, TrendingUp } from 'lucide-react';
import Button from './ui/Button';
import { useWatchlistStore } from '../store/watchlistStore';

export default function EmptyState() {
  const { addTicker, setCommandPaletteOpen } = useWatchlistStore();

  const starterTickers = [
    { ticker: 'NVDA', name: 'NVIDIA', note: '+4.2% breakout' },
    { ticker: 'TSLA', name: 'Tesla', note: '3.2x volume surge' },
    { ticker: 'AAPL', name: 'Apple', note: 'Core tech stability' },
    { ticker: 'PLTR', name: 'Palantir', note: 'Enterprise AI momentum' }
  ];

  return (
    <div className="glass-card rounded-2xl p-10 text-center space-y-6 max-w-xl mx-auto my-8 border border-white/10">
      {/* Sleek SVG Illustration */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-violet-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xl">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-100 tracking-tight">
          Your Watchlist Triage Feed is Quiet
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Pulse doesn't just show spreadsheets of prices — it filters noise and highlights abnormal moves, volume surges, and level crossings. Add tickers to begin tracking.
        </p>
      </div>

      {/* Suggested Starter Tickers */}
      <div className="space-y-2 pt-2">
        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 block">
          Quick Start with Market Bellwethers:
        </span>
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          {starterTickers.map(s => (
            <button
              key={s.ticker}
              onClick={() => addTicker(s.ticker)}
              className="p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-teal-500/40 hover:bg-slate-800/80 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <span className="font-mono font-bold text-xs text-teal-300 group-hover:text-teal-200">
                  {s.ticker}
                </span>
                <span className="text-[10px] text-slate-400 block">{s.name}</span>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Button variant="primary" onClick={() => setCommandPaletteOpen(true)}>
          <Plus className="w-4 h-4" /> Open Command Palette (Cmd+K)
        </Button>
      </div>
    </div>
  );
}
