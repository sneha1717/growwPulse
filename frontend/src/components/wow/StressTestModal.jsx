import React, { useState } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  Flame,
  Globe
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

// Pre-configured macro shock stress scenarios
export const STRESS_SCENARIOS = {
  rate_spike: {
    id: 'rate_spike',
    title: 'Emergency RBI / Fed +75bps Rate Spike',
    badge: 'MONETARY SHOCK',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Central banks unexpectedly hike policy rates by 75 bps to squash persistent inflation. High-PE growth multiples compress, while banking net interest margins (NIMs) widen.',
    impactMap: {
      TSLA: -8.8,
      NVDA: -7.4,
      PLTR: -9.2,
      AMD: -6.8,
      ARM: -8.1,
      SMCI: -11.5,
      AAPL: -3.2,
      MSFT: -2.8,
      GOOGL: -3.5,
      AMZN: -4.1,
      HDFCBANK: +3.2,
      ICICIBANK: +2.8,
      RELIANCE: -1.5,
      TCS: -2.1,
      INFY: -2.5,
      TATAMOTORS: -4.8,
      ZOMATO: -6.2,
      ITC: +1.2
    },
    hedgeExplanation: 'Private banks (HDFC Bank, ICICI Bank) and FMCG cash cows act as safe-haven hedges due to floating-rate loan books and inelastic consumer demand.'
  },
  crude_oil: {
    id: 'crude_oil',
    title: 'Geopolitical Strait of Hormuz Crude Spike ($120/bbl)',
    badge: 'ENERGY SHOCK',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    description: 'Maritime conflict closes vital shipping chokepoints, sending global crude oil to $120/barrel. Refining margins explode, but input costs hammer transportation, auto, and consumer retail.',
    impactMap: {
      RELIANCE: +8.4,
      COIN: -5.2,
      TATAMOTORS: -6.8,
      ZOMATO: -5.5,
      TCS: -1.2,
      INFY: -1.4,
      HDFCBANK: -2.2,
      ICICIBANK: -2.0,
      ITC: -0.8,
      TSLA: -4.2,
      NVDA: -2.1,
      AAPL: -1.8,
      MSFT: -1.2,
      GOOGL: -1.5,
      AMZN: -4.5
    },
    hedgeExplanation: 'Reliance Industries acts as an aggressive hedge due to massive gross refining margin (GRM) expansion and petrochemical inventory revaluation.'
  },
  ai_capex_bust: {
    id: 'ai_capex_bust',
    title: 'Hyperscaler AI CapEx Bubble Hangover (-25%)',
    badge: 'TECH DIGESTION',
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    description: 'Top cloud providers announce a 25% reduction in 2026 data center capital expenditures to digest existing GPU clusters. Hardware providers plunge; software SaaS and enterprise IT hold firm.',
    impactMap: {
      NVDA: -16.4,
      SMCI: -18.2,
      ARM: -13.5,
      AMD: -12.1,
      TSLA: -7.5,
      MSFT: -2.2,
      GOOGL: -1.8,
      AAPL: +0.6,
      TCS: +1.8,
      INFY: +1.5,
      HDFCBANK: +1.2,
      RELIANCE: +0.4,
      ITC: +0.9
    },
    hedgeExplanation: 'Legacy IT services (TCS, Infosys) and non-tech dividend champions capture rotational liquidity fleeing merchant accelerator hardware.'
  },
  budget_supercycle: {
    id: 'budget_supercycle',
    title: '🇮🇳 India Union Budget Infra & PLI Super-Cycle (+15%)',
    badge: 'GROWTH CATALYST',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Government announces unprecedented capital outlay for EV infrastructure, green hydrogen, and digital public goods, triggering multi-year private capex acceleration.',
    impactMap: {
      TATAMOTORS: +9.4,
      RELIANCE: +6.8,
      ZOMATO: +8.1,
      HDFCBANK: +4.2,
      ICICIBANK: +4.8,
      TCS: +3.2,
      INFY: +3.6,
      ITC: +2.5,
      NVDA: +3.1,
      TSLA: +4.5,
      AAPL: +2.2
    },
    hedgeExplanation: 'Domestic cyclicals and automotive OEMs capture sovereign capex tailwinds, outperforming global broad-market indices.'
  }
};

export default function StressTestModal({
  isOpen,
  onClose,
  feedData,
  onApplyScenario,
  onClearScenario,
  activeScenarioId = null
}) {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('rate_spike');

  if (!feedData) return null;

  const currentScenario = STRESS_SCENARIOS[selectedScenarioKey];
  const allItems = [...(feedData.needsAttention || []), ...(feedData.quiet || [])];

  // Compute portfolio-level impact for the selected scenario
  let totalDelta = 0;
  let impactedItems = [];

  allItems.forEach(item => {
    // Default fallback impact based on ticker or sector beta
    const deltaPct = currentScenario.impactMap[item.ticker] !== undefined
      ? currentScenario.impactMap[item.ticker]
      : (item.sector?.includes('Tech') || item.sector?.includes('Semi') ? -4.5 : -1.5);

    const originalPrice = item.price;
    const stressedPrice = parseFloat((originalPrice * (1 + deltaPct / 100)).toFixed(2));
    totalDelta += deltaPct;

    impactedItems.push({
      ...item,
      deltaPct,
      stressedPrice,
      isWinner: deltaPct > 0
    });
  });

  const avgPortfolioImpact = allItems.length > 0 ? parseFloat((totalDelta / allItems.length).toFixed(2)) : 0;
  
  // Find top hedge (best positive performance) and most vulnerable
  impactedItems.sort((a, b) => b.deltaPct - a.deltaPct);
  const topHedge = impactedItems[0];
  const mostVulnerable = impactedItems[impactedItems.length - 1];

  const handleApply = () => {
    onApplyScenario(selectedScenarioKey, impactedItems);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Black Swan & Macro Stress-Test Simulator"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 text-xs">
        {/* Scenario Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.entries(STRESS_SCENARIOS).map(([key, sc]) => {
            const isSelected = selectedScenarioKey === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedScenarioKey(key)}
                className={`p-3 rounded-xl border text-left transition-all space-y-1.5 ${
                  isSelected
                    ? 'glass-card border-teal-400 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                    : 'glass-panel border-white/5 hover:border-white/20 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                </div>
                <h4 className="text-xs font-bold text-slate-100 font-mono">
                  {sc.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Shock Impact Overview Dashboard */}
        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-3 bg-slate-950/60">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="font-mono uppercase font-bold text-slate-100 text-xs">
                Simulated Watchlist Covariance Impact
              </span>
            </div>
            <div className="font-mono text-xs">
              <span className="text-slate-400 mr-1.5">Net Watchlist Drawdown:</span>
              <span className={`font-black text-sm ${avgPortfolioImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {avgPortfolioImpact >= 0 ? '+' : ''}{avgPortfolioImpact}%
              </span>
            </div>
          </div>

          {/* Key Insights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {/* Top Hedge Asset */}
            {topHedge && (
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold block">TOP SAFE-HAVEN HEDGE</span>
                  <span className="text-slate-100 font-bold">{topHedge.ticker} ({topHedge.name})</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold text-sm">+{topHedge.deltaPct}%</span>
                  <span className="text-[10px] text-slate-400 block">{topHedge.symbolPrefix || '$'}{topHedge.stressedPrice}</span>
                </div>
              </div>
            )}

            {/* Most Vulnerable Asset */}
            {mostVulnerable && (
              <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-400 font-bold block">MAX DRAWDOWN VULNERABILITY</span>
                  <span className="text-slate-100 font-bold">{mostVulnerable.ticker} ({mostVulnerable.name})</span>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-bold text-sm">{mostVulnerable.deltaPct}%</span>
                  <span className="text-[10px] text-slate-400 block">{mostVulnerable.symbolPrefix || '$'}{mostVulnerable.stressedPrice}</span>
                </div>
              </div>
            )}
          </div>

          {/* Institutional Hedge Explanation */}
          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
            <strong className="text-teal-300">Risk Manager Analysis: </strong>
            {currentScenario.hedgeExplanation}
          </p>
        </div>

        {/* Stock Impact Table */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>TICKER SIMULATION SPREAD</span>
            <span>CURRENT $\rightarrow$ STRESSED</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
            {impactedItems.map(item => (
              <div
                key={item.ticker}
                className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{item.ticker}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px] font-sans">{item.sector}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">
                    {item.symbolPrefix || '$'}{item.price} → <strong className="text-slate-200">{item.symbolPrefix || '$'}{item.stressedPrice}</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    item.deltaPct >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {item.deltaPct >= 0 ? '+' : ''}{item.deltaPct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {activeScenarioId ? (
            <Button variant="secondary" size="sm" onClick={() => { onClearScenario(); onClose(); }}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Live Real Data</span>
            </Button>
          ) : (
            <span className="text-[10px] text-slate-500 font-mono">
              Simulates how the Attention Triage Engine reacts to macro shocks.
            </span>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="gradient" size="sm" onClick={handleApply}>
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Apply Shock to Dashboard Feed</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
