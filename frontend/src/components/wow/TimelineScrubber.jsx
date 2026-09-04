import React from 'react';
import { History, Play, RotateCcw, FastForward } from 'lucide-react';
import { useWatchlistStore } from '../../store/watchlistStore';

export default function TimelineScrubber({ slices = [] }) {
  const { selectedTimelineId, setSelectedTimelineId } = useWatchlistStore();

  if (!slices || slices.length === 0) return null;

  const activeSlice = slices.find(s => s.id === selectedTimelineId) || slices[0];
  const currentIndex = slices.findIndex(s => s.id === selectedTimelineId);

  const handleNext = () => {
    if (currentIndex > 0) {
      setSelectedTimelineId(slices[currentIndex - 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex < slices.length - 1) {
      setSelectedTimelineId(slices[currentIndex + 1].id);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            Attention Timeline Replay
          </h4>
          {selectedTimelineId !== 'now' && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 animate-pulse">
              HISTORICAL REPLAY MODE
            </span>
          )}
        </div>

        {/* Current Point Overview */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Top mover at point:</span>
          <span className="font-mono font-bold text-teal-400">
            {activeSlice.topAttentionTicker} ({activeSlice.topAttentionScore} score)
          </span>
          {selectedTimelineId !== 'now' && (
            <button
              onClick={() => setSelectedTimelineId('now')}
              className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 ml-2"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Now
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrubber Track */}
      <div className="grid grid-cols-6 gap-2 pt-1">
        {slices.map((slice, idx) => {
          const isSelected = slice.id === selectedTimelineId;
          return (
            <button
              key={slice.id}
              onClick={() => setSelectedTimelineId(slice.id)}
              className={`py-2 px-1.5 rounded-xl text-center transition-all duration-200 border flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-gradient-to-b from-teal-500/20 to-violet-500/20 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.25)] text-teal-200'
                  : 'bg-slate-900/40 border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-semibold block">{slice.label}</span>
              <span className={`text-[9px] font-mono block ${isSelected ? 'text-teal-300' : 'text-slate-500'}`}>
                {slice.topAttentionTicker}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
