import React from 'react';

export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-slate-400">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/40 transition-all font-sans ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-400 mt-1">{error}</p>
      )}
    </div>
  );
}
