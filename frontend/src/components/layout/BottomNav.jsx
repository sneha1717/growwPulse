import React from 'react';
import { Activity, Swords, Briefcase, Bot, Key, Sparkles } from 'lucide-react';

export default function BottomNav({
  activeWorkspace = 'triage',
  setActiveWorkspace,
  onOpenCopilot,
  onOpenApiKey
}) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0E17]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.7)] safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Tab 1: Triage Feed */}
        <button
          onClick={() => setActiveWorkspace && setActiveWorkspace('triage')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            activeWorkspace === 'triage'
              ? 'text-teal-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeWorkspace === 'triage' ? 'bg-teal-500/20 shadow-[0_0_12px_rgba(20,184,166,0.3)]' : ''}`}>
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">Triage</span>
        </button>

        {/* Tab 2: Stock Duel */}
        <button
          onClick={() => setActiveWorkspace && setActiveWorkspace('duel')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            activeWorkspace === 'duel'
              ? 'text-violet-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeWorkspace === 'duel' ? 'bg-violet-500/20 shadow-[0_0_12px_rgba(139,92,246,0.3)]' : ''}`}>
            <Swords className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">Duel</span>
        </button>

        {/* Tab 3: Paper Trader */}
        <button
          onClick={() => setActiveWorkspace && setActiveWorkspace('paper')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            activeWorkspace === 'paper'
              ? 'text-emerald-300 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeWorkspace === 'paper' ? 'bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : ''}`}>
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">Paper</span>
        </button>

        {/* Tab 4: AI Co-Pilot */}
        <button
          onClick={onOpenCopilot}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-teal-400 hover:text-teal-300 transition-all group"
        >
          <div className="p-1 rounded-lg bg-teal-500/10 border border-teal-500/20 group-hover:bg-teal-500/20 relative">
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <Bot className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">Co-Pilot</span>
        </button>

        {/* Tab 5: Finnhub API Key Status */}
        <button
          onClick={onOpenApiKey}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
          title="Finnhub API Key & Live Data Engine"
        >
          <div className="p-1 rounded-lg relative">
            <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] tracking-tight font-medium">API Key</span>
        </button>
      </div>
    </nav>
  );
}
