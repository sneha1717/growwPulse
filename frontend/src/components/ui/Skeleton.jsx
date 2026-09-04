import React from 'react';

export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`shimmer-bg rounded-lg bg-slate-800/50 ${className}`}
    />
  );
}
