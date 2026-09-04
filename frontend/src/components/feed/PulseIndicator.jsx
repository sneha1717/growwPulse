import React from 'react';

export default function PulseIndicator({ isLive = true, timestamp, className = '' }) {
  // Check if timestamp was within the last 90 seconds
  const isRecent = timestamp 
    ? (Date.now() - new Date(timestamp).getTime() < 90000) 
    : isLive;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} title={isRecent ? "Live tick active" : "Polled snapshot"}>
      <span className="relative flex h-2 w-2">
        {isRecent && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 duration-1000" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isRecent ? 'bg-teal-400 shadow-[0_0_8px_#14b8a6]' : 'bg-slate-500'}`} />
      </span>
      {isRecent && (
        <span className="text-[10px] font-mono tracking-wider text-teal-400/90 font-medium">LIVE</span>
      )}
    </div>
  );
}
