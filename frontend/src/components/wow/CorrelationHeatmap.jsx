import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import Skeleton from '../ui/Skeleton';
import { Grid, Info } from 'lucide-react';

export default function CorrelationHeatmap({ watchlistId }) {
  const [data, setData] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!watchlistId) return;
    setIsLoading(true);
    api.getCorrelation(watchlistId)
      .then(res => {
        setData(res);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load correlation:', err);
        setIsLoading(false);
      });
  }, [watchlistId]);

  if (isLoading) {
    return (
      <div className="h-64 p-4">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
    );
  }

  if (!data || !data.tickers || data.tickers.length < 2) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs glass-card rounded-2xl">
        Add at least 2 tickers to compute cross-asset Pearson correlation.
      </div>
    );
  }

  const tickers = data.tickers;
  const matrix = data.matrix || {};

  // Color generator based on Pearson correlation value (-1.0 to +1.0)
  const getCellColor = (val) => {
    if (val === 1.0) return 'bg-teal-500/80 text-slate-950 font-bold'; // diagonal
    if (val > 0.7) return 'bg-emerald-500/60 text-emerald-100';
    if (val > 0.3) return 'bg-teal-500/30 text-teal-200';
    if (val > -0.3) return 'bg-slate-800/60 text-slate-400';
    if (val > -0.7) return 'bg-rose-500/30 text-rose-200';
    return 'bg-rose-600/70 text-rose-100 font-bold';
  };

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-semibold text-slate-100">Cross-Asset Correlation Matrix</h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/60 inline-block" /> -1.0 (Inverse)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block" /> 0.0 (Uncorrelated)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-teal-500/60 inline-block" /> +1.0 (Correlated)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-mono text-slate-500 text-left">TICKER</th>
              {tickers.map(t => (
                <th key={t} className="p-2 text-xs font-mono font-bold text-slate-300">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickers.map(t1 => (
              <tr key={t1} className="border-t border-white/5">
                <td className="p-2 text-xs font-mono font-bold text-slate-300 text-left">
                  {t1}
                </td>
                {tickers.map(t2 => {
                  const val = matrix[t1]?.[t2] !== undefined ? matrix[t1][t2] : 0;
                  const isHovered = hoveredCell && hoveredCell.t1 === t1 && hoveredCell.t2 === t2;

                  return (
                    <td
                      key={t2}
                      onMouseEnter={() => setHoveredCell({ t1, t2, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`p-2.5 text-xs font-mono transition-all cursor-pointer rounded-lg m-0.5 ${getCellColor(val)} ${isHovered ? 'ring-2 ring-teal-400 scale-105 z-10 shadow-lg' : ''}`}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && (
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-teal-500/20 text-xs flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Pair: <strong className="text-teal-300">{hoveredCell.t1}</strong> vs <strong className="text-teal-300">{hoveredCell.t2}</strong></span>
          </div>
          <div className="font-mono">
            Pearson r = <span className="font-bold text-slate-100">{hoveredCell.val.toFixed(3)}</span>
            <span className="text-[11px] text-slate-400 ml-2">
              ({hoveredCell.val > 0.5 ? 'Strong co-movement' : hoveredCell.val < -0.3 ? 'Hedging / Inverse' : 'Diversified'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
