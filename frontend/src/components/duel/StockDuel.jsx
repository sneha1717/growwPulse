import React, { useState } from 'react';
import { 
  Swords, 
  ArrowRightLeft, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Flame, 
  BarChart3, 
  Percent, 
  Award,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import Button from '../ui/Button';
import { usePaperTradingStore } from '../../store/paperTradingStore';
import { playCyberClick } from '../../utils/soundFx';

export default function StockDuel({ items = [] }) {
  const { openTradeModal } = usePaperTradingStore();

  const [stockAKey, setStockAKey] = useState(items[0]?.ticker || 'NVDA');
  const [stockBKey, setStockBKey] = useState(items[1]?.ticker || 'TSLA');

  if (!items || items.length < 2) {
    return (
      <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center text-slate-400 max-w-full">
        <Swords className="w-10 h-10 mx-auto text-teal-400 mb-3 shrink-0" />
        <p>Add at least 2 stocks to your active watchlist to launch the Stock Duel Studio.</p>
      </div>
    );
  }

  const stockA = items.find(i => i.ticker === stockAKey) || items[0];
  const stockB = items.find(i => i.ticker === stockBKey) || items[1];

  const handleSwap = () => {
    playCyberClick();
    setStockAKey(stockB.ticker);
    setStockBKey(stockA.ticker);
  };

  // Metric extraction & normalization
  const aChange = stockA.changePct || 0;
  const bChange = stockB.changePct || 0;
  const aZScore = stockA.scoreBreakdown?.relativeMoveZScore || (Math.abs(aChange) / 1.5);
  const bZScore = stockB.scoreBreakdown?.relativeMoveZScore || (Math.abs(bChange) / 1.5);
  const aVol = stockA.scoreBreakdown?.volumeAnomalyRatio || 1.2;
  const bVol = stockB.scoreBreakdown?.volumeAnomalyRatio || 1.2;
  const aScore = stockA.attentionScore || 50;
  const bScore = stockB.attentionScore || 50;

  // 52-week position %
  const getRangePct = (item) => {
    const high = item.high52 || item.price * 1.15;
    const low = item.low52 || item.price * 0.85;
    if (high === low) return 50;
    return Math.min(100, Math.max(0, Math.round(((item.price - low) / (high - low)) * 100)));
  };

  const aRangePct = getRangePct(stockA);
  const bRangePct = getRangePct(stockB);

  // Determine winners
  const momentumWinner = aChange >= bChange ? stockA : stockB;
  const attentionWinner = aScore >= bScore ? stockA : stockB;
  const volumeWinner = aVol >= bVol ? stockA : stockB;
  const stabilityWinner = aZScore <= bZScore ? stockA : stockB;

  // Correlation estimate
  const estimatedCorr = stockA.sector === stockB.sector ? 0.76 : 0.34;

  const duelPresets = [
    { label: '⚡ NVDA vs TSLA', a: 'NVDA', b: 'TSLA' },
    { label: '🇮🇳 RELIANCE vs TCS', a: 'RELIANCE', b: 'TCS' },
    { label: '🚗 TSLA vs AAPL', a: 'TSLA', b: 'AAPL' },
    { label: '🍔 ZOMATO vs TATAMOTORS', a: 'ZOMATO', b: 'TATAMOTORS' }
  ].filter(p => items.some(i => i.ticker === p.a) && items.some(i => i.ticker === p.b));

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Studio Header */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4 max-w-full overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight break-words">
                  Stock Duel <span className="text-slate-400 font-normal hidden sm:inline">— Head-to-Head Factor Comparator</span>
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold shrink-0">
                  QUANT SHOWDOWN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 break-words">
                Pit any two watchlist holdings against each other across momentum, volatility z-scores, and institutional conviction.
              </p>
            </div>
          </div>

          {/* Quick Preset Pills */}
          {duelPresets.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full shrink-0">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold shrink-0">Presets:</span>
              {duelPresets.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => {
                    playCyberClick();
                    setStockAKey(preset.a);
                    setStockBKey(preset.b);
                  }}
                  className="px-2.5 py-1 rounded-lg glass-panel hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-white/10 shrink-0 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dual Selection Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-4 items-center pt-2">
          {/* Fighter A Card */}
          <div className="lg:col-span-4 glass-card rounded-2xl p-4 sm:p-5 border-2 border-teal-500/30 bg-gradient-to-br from-teal-950/20 to-slate-900/80 space-y-3 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 shrink-0">
                FIGHTER A (CYAN)
              </span>
              <button
                onClick={() => openTradeModal(stockA.ticker)}
                className="text-[11px] font-mono text-teal-400 hover:underline flex items-center gap-1 shrink-0"
              >
                + Paper Trade <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <select
                  value={stockA.ticker}
                  onChange={(e) => setStockAKey(e.target.value)}
                  className="w-full truncate bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm sm:text-base font-black text-slate-100 font-mono focus:border-teal-500 focus:outline-none cursor-pointer"
                >
                  {items.map(i => (
                    <option key={i.ticker} value={i.ticker}>
                      {i.ticker} {i.companyName ? `• ${i.companyName}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-lg sm:text-xl font-black font-mono text-slate-100">
                  {stockA.symbolPrefix || '$'}{stockA.price}
                </div>
                <div className={`text-xs font-mono font-bold ${aChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {aChange >= 0 ? '+' : ''}{aChange}%
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 truncate">
              {stockA.sector} • {stockA.fiiFlow ? `FII: ${stockA.fiiFlow}` : 'Institutional Accumulation'}
            </div>
          </div>

          {/* Center VS & Swap Button */}
          <div className="lg:col-span-1 flex flex-row lg:flex-col items-center justify-center gap-2 py-1">
            <button
              onClick={handleSwap}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 shadow-xl transition-all group"
              title="Swap Fighters"
            >
              <ArrowRightLeft className="w-5 h-5 text-teal-400 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <span className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-widest">VS</span>
          </div>

          {/* Fighter B Card */}
          <div className="lg:col-span-4 glass-card rounded-2xl p-4 sm:p-5 border-2 border-violet-500/30 bg-gradient-to-br from-violet-950/20 to-slate-900/80 space-y-3 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 shrink-0">
                FIGHTER B (VIOLET)
              </span>
              <button
                onClick={() => openTradeModal(stockB.ticker)}
                className="text-[11px] font-mono text-violet-400 hover:underline flex items-center gap-1 shrink-0"
              >
                + Paper Trade <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <select
                  value={stockB.ticker}
                  onChange={(e) => setStockBKey(e.target.value)}
                  className="w-full truncate bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm sm:text-base font-black text-slate-100 font-mono focus:border-violet-500 focus:outline-none cursor-pointer"
                >
                  {items.map(i => (
                    <option key={i.ticker} value={i.ticker}>
                      {i.ticker} {i.companyName ? `• ${i.companyName}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-lg sm:text-xl font-black font-mono text-slate-100">
                  {stockB.symbolPrefix || '$'}{stockB.price}
                </div>
                <div className={`text-xs font-mono font-bold ${bChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {bChange >= 0 ? '+' : ''}{bChange}%
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 truncate">
              {stockB.sector} • {stockB.fiiFlow ? `FII: ${stockB.fiiFlow}` : 'Institutional Accumulation'}
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head Factor Breakdown Bars */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 space-y-6 max-w-full overflow-hidden">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-teal-400 shrink-0" />
          Factor Dimension Showdown
        </h3>

        <div className="space-y-5">
          {/* Factor 1: 24h Relative Return */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold text-teal-300 truncate max-w-[35%] text-left">{stockA.ticker}: {aChange > 0 ? '+' : ''}{aChange}%</span>
              <span className="text-slate-400 font-sans font-semibold text-center text-[11px] sm:text-xs shrink-0">24h Day Return</span>
              <span className="font-bold text-violet-300 truncate max-w-[35%] text-right">{stockB.ticker}: {bChange > 0 ? '+' : ''}{bChange}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex">
              <div
                style={{ width: `${Math.max(15, Math.min(85, (Math.abs(aChange) / (Math.abs(aChange) + Math.abs(bChange) || 1)) * 100))}%` }}
                className="bg-teal-500 h-full transition-all duration-500"
              />
              <div className="flex-1 bg-violet-500 h-full transition-all duration-500" />
            </div>
          </div>

          {/* Factor 2: Attention Triage Score */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold text-teal-300 truncate max-w-[35%] text-left">{stockA.ticker}: {aScore} pts</span>
              <span className="text-slate-400 font-sans font-semibold text-center text-[11px] sm:text-xs shrink-0">Attention Triage Score</span>
              <span className="font-bold text-violet-300 truncate max-w-[35%] text-right">{stockB.ticker}: {bScore} pts</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex">
              <div
                style={{ width: `${Math.max(15, Math.min(85, (aScore / (aScore + bScore || 1)) * 100))}%` }}
                className="bg-teal-500 h-full transition-all duration-500"
              />
              <div className="flex-1 bg-violet-500 h-full transition-all duration-500" />
            </div>
          </div>

          {/* Factor 3: Volatility Z-Score (Sigma) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold text-teal-300 truncate max-w-[35%] text-left">{stockA.ticker}: {aZScore.toFixed(2)}σ</span>
              <span className="text-slate-400 font-sans font-semibold text-center text-[11px] sm:text-xs shrink-0">Abnormal Volatility Z-Score</span>
              <span className="font-bold text-violet-300 truncate max-w-[35%] text-right">{stockB.ticker}: {bZScore.toFixed(2)}σ</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex">
              <div
                style={{ width: `${Math.max(15, Math.min(85, (aZScore / (aZScore + bZScore || 1)) * 100))}%` }}
                className="bg-teal-500 h-full transition-all duration-500"
              />
              <div className="flex-1 bg-violet-500 h-full transition-all duration-500" />
            </div>
          </div>

          {/* Factor 4: Volume Surge Ratio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold text-teal-300 truncate max-w-[35%] text-left">{stockA.ticker}: {aVol.toFixed(1)}x avg</span>
              <span className="text-slate-400 font-sans font-semibold text-center text-[11px] sm:text-xs shrink-0">Volume Anomaly Multiple</span>
              <span className="font-bold text-violet-300 truncate max-w-[35%] text-right">{stockB.ticker}: {bVol.toFixed(1)}x avg</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex">
              <div
                style={{ width: `${Math.max(15, Math.min(85, (aVol / (aVol + bVol || 1)) * 100))}%` }}
                className="bg-teal-500 h-full transition-all duration-500"
              />
              <div className="flex-1 bg-violet-500 h-full transition-all duration-500" />
            </div>
          </div>

          {/* Factor 5: 52-Week Range High Dominance */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold text-teal-300 truncate max-w-[35%] text-left">{stockA.ticker}: {aRangePct}%</span>
              <span className="text-slate-400 font-sans font-semibold text-center text-[11px] sm:text-xs shrink-0">52-Week Range Position</span>
              <span className="font-bold text-violet-300 truncate max-w-[35%] text-right">{stockB.ticker}: {bRangePct}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex">
              <div
                style={{ width: `${aRangePct}%` }}
                className="bg-teal-500 h-full transition-all duration-500"
              />
              <div className="flex-1 bg-violet-500 h-full transition-all duration-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Automated Plain-English Quant Triage Verdict */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 max-w-full overflow-hidden">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400 shrink-0" />
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
            Automated Quant Triage Verdict
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1 overflow-hidden">
            <span className="text-[10px] text-teal-400 font-bold uppercase block">⚡ Momentum Alpha Leader</span>
            <div className="text-sm font-bold text-slate-100 truncate">{momentumWinner.ticker}</div>
            <p className="text-[11px] text-slate-400 font-sans break-words">
              Outperforming on relative return with higher institutional volume conviction.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1 overflow-hidden">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block">🛡️ Defensive Low-Drawdown Anchor</span>
            <div className="text-sm font-bold text-slate-100 truncate">{stabilityWinner.ticker}</div>
            <p className="text-[11px] text-slate-400 font-sans break-words">
              Lower volatility z-score ({stabilityWinner === stockA ? aZScore.toFixed(2) : bZScore.toFixed(2)}σ) makes this the superior macro crisis hedge.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1 overflow-hidden">
            <span className="text-[10px] text-violet-400 font-bold uppercase block">🔗 Pairwise Diversification</span>
            <div className="text-sm font-bold text-slate-100 truncate">r = {estimatedCorr > 0 ? '+' : ''}{estimatedCorr}</div>
            <p className="text-[11px] text-slate-400 font-sans break-words">
              {estimatedCorr > 0.6
                ? 'High positive correlation: holding both concentrates sector risk.'
                : 'Low correlation: excellent multi-asset diversification benefit.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
