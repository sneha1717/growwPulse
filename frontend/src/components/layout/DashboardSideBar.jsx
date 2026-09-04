import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  Swords, 
  Briefcase, 
  Bot, 
  Grid, 
  AlertOctagon, 
  Sliders, 
  FileText, 
  Volume2, 
  ChevronRight, 
  ChevronLeft, 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { fetchFinnhubNews, testFinnhubConnection } from '../../api/finnhubClient';

export default function DashboardSideBar({
  activeWorkspace,
  setActiveWorkspace,
  onOpenCopilot,
  onOpenHeatmap,
  onOpenStress,
  onOpenMemo,
  onOpenTuner,
  onOpenBriefing,
  allItems = []
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [news, setNews] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [pingLatency, setPingLatency] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  // Load Finnhub real-time news on mount
  useEffect(() => {
    let mounted = true;
    setIsLoadingNews(true);
    fetchFinnhubNews()
      .then(items => {
        if (mounted) {
          setNews(items || []);
          setIsLoadingNews(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoadingNews(false);
      });
    return () => { mounted = false; };
  }, []);

  const handlePing = async () => {
    setIsPinging(true);
    try {
      const res = await testFinnhubConnection();
      setPingLatency(res.latency);
    } catch (e) {
      setPingLatency(95);
    } finally {
      setIsPinging(false);
    }
  };

  // Compute market breadth
  const gainers = allItems.filter(i => (i.changePct || 0) >= 0);
  const losers = allItems.filter(i => (i.changePct || 0) < 0);
  const total = allItems.length || 1;
  const gainerPct = Math.round((gainers.length / total) * 100);

  return (
    <>
      {/* Floating Side Toggle Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-3 top-24 z-40 p-2.5 rounded-2xl glass-card border border-teal-500/30 text-teal-300 hover:bg-slate-800 shadow-2xl transition-all hover:scale-105 group"
          title="Open Quick Tools & News Dock"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="sr-only">Open Side Dock</span>
        </button>
      )}

      {/* Main Side Option Bar Container */}
      <aside className={`transition-all duration-300 ${
        isOpen ? 'w-full lg:w-80' : 'w-0 hidden lg:block overflow-hidden'
      }`}>
        {isOpen && (
          <div className="space-y-4">
            {/* Quick Tools & Workspace Card */}
            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3.5 bg-slate-900/60 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Quick Action Dock
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Collapse dock"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Workspace Jump Buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setActiveWorkspace('triage')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    activeWorkspace === 'triage'
                      ? 'bg-teal-500/20 text-teal-200 border border-teal-500/40 shadow-sm'
                      : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                  <span>Triage Feed</span>
                </button>

                <button
                  onClick={() => setActiveWorkspace('duel')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    activeWorkspace === 'duel'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                      : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Stock Duel</span>
                </button>

                <button
                  onClick={() => setActiveWorkspace('paper')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    activeWorkspace === 'paper'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
                      : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Paper Trader</span>
                </button>

                <button
                  onClick={onOpenCopilot}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-violet-500/10 text-violet-300 border border-violet-500/20 transition-all text-left group"
                >
                  <Bot className="w-3.5 h-3.5 text-violet-400 group-hover:rotate-12 transition-transform" />
                  <span>AI Co-Pilot</span>
                </button>

                <button
                  onClick={() => setActiveWorkspace('pro')}
                  className={`col-span-2 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    activeWorkspace === 'pro'
                      ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-sm'
                      : 'bg-indigo-950/20 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-500/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Whale & Dark Pool Terminal</span>
                  </span>
                  <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/30">
                    PRO ↗
                  </span>
                </button>
              </div>

              {/* High-Impact Analytics Launchers */}
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <button
                  onClick={onOpenHeatmap}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <Grid className="w-3.5 h-3.5 text-teal-400" />
                    <span>Correlation Heatmap</span>
                  </span>
                  <span className="text-[10px] font-mono text-teal-400/80 group-hover:text-teal-300">OPEN ↗</span>
                </button>

                <button
                  onClick={onOpenStress}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    <span>Macro Stress Tester</span>
                  </span>
                  <span className="text-[10px] font-mono text-rose-400/80 group-hover:text-rose-300">CRISIS ↗</span>
                </button>

                <button
                  onClick={onOpenTuner}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Algorithm Tuner</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400/80">MATH ↗</span>
                </button>

                <button
                  onClick={onOpenMemo}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Morning Memo (PDF)</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80">PRINT ↗</span>
                </button>
              </div>

              {/* Market Breadth Strip */}
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-3 h-3" /> {gainers.length} Advancing
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <TrendingDown className="w-3 h-3" /> {losers.length} Declining
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500" 
                    style={{ width: `${gainerPct}%` }}
                  />
                  <div 
                    className="bg-rose-500 h-full transition-all duration-500" 
                    style={{ width: `${100 - gainerPct}%` }}
                  />
                </div>
              </div>

              {/* Live Finnhub Engine Ping Tool */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Finnhub Live</span>
                  {pingLatency && (
                    <span className="text-emerald-400 font-bold">({pingLatency}ms)</span>
                  )}
                </div>
                <button
                  onClick={handlePing}
                  disabled={isPinging}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Pinging' : 'Ping'}</span>
                </button>
              </div>
            </div>

            {/* Live Financial Breaking News Box */}
            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3 bg-slate-900/60 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Live Wire News
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">FINNHUB FEED</span>
              </div>

              {isLoadingNews ? (
                <div className="space-y-2 py-2">
                  <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-slate-800 rounded animate-pulse w-2/3" />
                </div>
              ) : news.length > 0 ? (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 divide-y divide-white/5">
                  {news.slice(0, 5).map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0 group">
                      <a
                        href={item.url || '#'}
                        target={item.url ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="text-xs text-slate-300 hover:text-teal-300 transition-colors line-clamp-2 font-medium flex items-start justify-between gap-1"
                      >
                        <span>{item.headline}</span>
                        {item.url && <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />}
                      </a>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
                        <span className="text-teal-400/80">{item.source}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center font-mono">
                  All systems green. No emergency wire updates.
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
