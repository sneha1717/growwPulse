import React from 'react';

export default function AmbientBackground() {
  // Abstract sparkline SVG paths
  const sparklines = [
    "M0,25 Q15,5 30,20 T60,10 T90,30 T120,5 T150,15 T180,2",
    "M0,15 Q20,35 40,10 T80,25 T120,8 T160,30 T200,12",
    "M0,30 Q30,5 60,28 T120,12 T180,35 T220,15 T260,2"
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Deep atmospheric radial glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-teal-500/10 via-violet-600/5 to-transparent blur-[120px] rounded-full" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-violet-600/5 blur-[140px] rounded-full" />
      <div className="absolute bottom-10 -left-32 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full" />

      {/* Row 1: Left-to-right subtle sparklines tape */}
      <div className="absolute top-16 left-0 right-0 opacity-[0.07] flex gap-12 whitespace-nowrap animate-ticker-slow">
        {[...Array(8)].map((_, i) => (
          <div key={`r1-${i}`} className="inline-flex items-center gap-6">
            <span className="text-xs font-mono font-bold tracking-widest text-teal-400">PULSE // MARKET_STREAM</span>
            <svg className="w-48 h-8" viewBox="0 0 200 40" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={sparklines[i % 3]} stroke="#14b8a6" />
            </svg>
            <span className="text-xs font-mono text-violet-400">▲ +3.42σ</span>
          </div>
        ))}
      </div>

      {/* Row 2: Right-to-left reverse tape */}
      <div className="absolute top-36 left-0 right-0 opacity-[0.05] flex gap-16 whitespace-nowrap animate-ticker-reverse">
        {[...Array(8)].map((_, i) => (
          <div key={`r2-${i}`} className="inline-flex items-center gap-6">
            <svg className="w-56 h-8" viewBox="0 0 200 40" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={sparklines[(i + 1) % 3]} stroke="#8b5cf6" />
            </svg>
            <span className="text-xs font-mono tracking-widest text-slate-400">TRIAGE_ZSCORE // VOL_SURGE</span>
            <span className="text-xs font-mono text-teal-400">3.2x VOL</span>
          </div>
        ))}
      </div>
    </div>
  );
}
