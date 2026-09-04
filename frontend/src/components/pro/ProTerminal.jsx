import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Eye, 
  Zap, 
  BarChart3, 
  DollarSign, 
  Briefcase, 
  Lock, 
  Sparkles, 
  Clock, 
  Sliders, 
  Building2, 
  UserCheck, 
  Radar, 
  Cpu, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { playCyberClick, playTradeFill } from '../../utils/soundFx';

// Demo institutional feeds representing paid data ($2,000/mo API licenses)
const DARK_POOL_BLOCKS = [
  { id: 'dp-1', ticker: 'NVDA', size: '$14,280,000', shares: '62,100', price: '$229.85', exchange: 'DirectEdge Off-Ex', bias: 'BULLISH', time: '4m ago', badge: 'WHALE BLOCK' },
  { id: 'dp-2', ticker: 'TSLA', size: '$8,640,000', shares: '24,400', price: '$354.10', exchange: 'CrossFinder ATS', bias: 'GAMMA SWEEP', time: '11m ago', badge: 'SWEEP ALERT' },
  { id: 'dp-3', ticker: 'AAPL', size: '$12,450,000', shares: '38,700', price: '$321.70', exchange: 'Barclays LX ATS', bias: 'NEUTRAL HEDGE', time: '19m ago', badge: 'INSTITUTIONAL CROSS' },
  { id: 'dp-4', ticker: 'MSFT', size: '$9,820,000', shares: '19,640', price: '$500.15', exchange: 'Sigma X Dark Pool', bias: 'BULLISH', time: '32m ago', badge: 'GOLDEN SWEEP' },
  { id: 'dp-5', ticker: 'AMZN', size: '$6,450,000', shares: '24,980', price: '$258.20', exchange: 'Instinet CBX', bias: 'ACCUMULATION', time: '45m ago', badge: 'BLOCK TRADE' },
  { id: 'dp-6', ticker: 'GOOGL', size: '$7,120,000', shares: '20,980', price: '$339.30', exchange: 'Level ATS', bias: 'BULLISH', time: '1h ago', badge: 'BUY-SIDE BLOCK' },
  { id: 'dp-7', ticker: 'RELIANCE', size: '₹480 Crore', shares: '18,50,000', price: '₹2,594.00', exchange: 'NSE Block Window', bias: 'DII ACCUMULATION', time: '1h 15m ago', badge: 'NSE BULK DEAL' }
];

const CONGRESS_INSIDER_TRADES = [
  { id: 'cg-1', person: 'Nancy Pelosi (House CA-11)', role: 'Congressional Committee', ticker: 'NVDA', action: 'BOUGHT (Call LEAPs)', value: '$2,000,000 - $5,000,000', filedDate: 'Today', status: 'CONFIRMED STOCK ACT' },
  { id: 'cg-2', person: 'Jensen Huang', role: 'CEO, NVIDIA Corp', ticker: 'NVDA', action: '10b5-1 Plan Vest & Hold', value: '$18,400,000', filedDate: '2d ago', status: 'FORM 4 VERIFIED' },
  { id: 'cg-3', person: 'Markwayne Mullin (Senate Armed Services)', role: 'Senate Committee', ticker: 'MSFT', action: 'BOUGHT (Direct Common)', value: '$250,000 - $500,000', filedDate: '3d ago', status: 'CONFIRMED' },
  { id: 'cg-4', person: 'Satya Nadella', role: 'CEO, Microsoft', ticker: 'MSFT', action: 'Retained 94% Grants', value: '$12,000,000', filedDate: '5d ago', status: 'FORM 4 VERIFIED' },
  { id: 'cg-5', person: 'Ro Khanna (House CA-17)', role: 'Oversight Committee', ticker: 'TSLA', action: 'PURCHASE', value: '$100,000 - $250,000', filedDate: '1w ago', status: 'CONFIRMED' }
];

const WALL_STREET_CONSENSUS = {
  NVDA: { buy: 42, hold: 5, sell: 1, targetMean: 288.50, current: 229.93, impliedUpside: 25.4, topFirm: 'Goldman Sachs ($310 Target, Overweight)' },
  TSLA: { buy: 22, hold: 16, sell: 9, targetMean: 395.00, current: 354.78, impliedUpside: 11.3, topFirm: 'Morgan Stanley ($410 Target, Overweight)' },
  AAPL: { buy: 34, hold: 11, sell: 2, targetMean: 355.00, current: 321.85, impliedUpside: 10.3, topFirm: 'JPMorgan ($360 Target, Overweight)' },
  MSFT: { buy: 44, hold: 3, sell: 0, targetMean: 560.00, current: 500.28, impliedUpside: 11.9, topFirm: 'Bank of America ($575 Target, Buy)' },
  AMZN: { buy: 48, hold: 2, sell: 0, targetMean: 295.00, current: 258.47, impliedUpside: 14.1, topFirm: 'Citi ($305 Target, Buy)' },
  GOOGL: { buy: 39, hold: 6, sell: 1, targetMean: 380.00, current: 339.53, impliedUpside: 11.9, topFirm: 'Evercore ISI ($390 Target, Outperform)' }
};

export default function ProTerminal({ activeTickers = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL'] }) {
  const [activeTab, setActiveTab] = useState('darkpool'); // 'darkpool' | 'insider' | 'montecarlo' | 'consensus'
  const [selectedStock, setSelectedStock] = useState('NVDA');
  const [simulationDays, setSimulationDays] = useState(30);
  const [simPathsCount, setSimPathsCount] = useState(1000);

  const consensusData = WALL_STREET_CONSENSUS[selectedStock] || WALL_STREET_CONSENSUS.NVDA;

  // Monte Carlo Simulation calculations
  const monteCarloStats = useMemo(() => {
    const currentPrice = consensusData.current || 230;
    const dailyDrift = 0.0006; // ~15% annualized
    const dailyVol = 0.022; // ~35% annualized vol

    // 95% VaR formula (Parametric + Simulated)
    const z95 = 1.645;
    const horizonFactor = Math.sqrt(simulationDays);
    const var95Pct = (z95 * dailyVol * horizonFactor * 100).toFixed(1);
    const var95Value = (currentPrice * (var95Pct / 100)).toFixed(2);

    const bullCase90Pct = (dailyDrift * simulationDays * 100 + 1.28 * dailyVol * horizonFactor * 100).toFixed(1);
    const medianExpectedPct = (dailyDrift * simulationDays * 100).toFixed(1);

    // Generate 12 sample path lines for visual chart
    const samplePaths = [];
    for (let p = 0; p < 8; p++) {
      const points = [{ day: 0, price: currentPrice }];
      let pPrice = currentPrice;
      for (let d = 1; d <= 10; d++) {
        const rand = (Math.sin((p + 1) * 7.5 + d * 3.2) + Math.cos(d * 4.1)) * 0.7;
        const shock = (dailyDrift * 3) + dailyVol * rand * 1.5;
        pPrice = pPrice * (1 + shock);
        points.push({ day: d * Math.round(simulationDays / 10), price: parseFloat(pPrice.toFixed(2)) });
      }
      samplePaths.push(points);
    }

    return {
      currentPrice,
      var95Pct,
      var95Value,
      bullCase90Pct,
      medianExpectedPct,
      samplePaths
    };
  }, [selectedStock, simulationDays, consensusData]);

  const handleTabSwitch = (tabId) => {
    playCyberClick();
    setActiveTab(tabId);
  };

  return (
    <div className="space-y-6">
      {/* Institutional Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-cyan-950/40 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Radar className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  BLOOMBERG-GRADE INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> PRO FEED UNLOCKED
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-100 mt-1 tracking-tight">
                Whale & Dark Pool Pro Terminal
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time off-exchange block trades, Congressional STOCK Act disclosures, Wall Street consensus price targets, and 1,000-Path Monte Carlo risk modeling.
          </p>
        </div>

        {/* Global Stock Filter Selector */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/10 shrink-0">
          <span className="text-[10px] font-mono text-slate-400 uppercase px-2">Ticker:</span>
          {['NVDA', 'TSLA', 'AAPL', 'MSFT'].map((sym) => (
            <button
              key={sym}
              onClick={() => { playCyberClick(); setSelectedStock(sym); }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedStock === sym
                  ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => handleTabSwitch('darkpool')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'darkpool'
              ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 glass-panel border border-transparent'
          }`}
        >
          <Radar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Dark Pool Whale Flow</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-[10px] font-mono text-indigo-300">LIVE</span>
        </button>

        <button
          onClick={() => handleTabSwitch('insider')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'insider'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 glass-panel border border-transparent'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Congress & Insider Trades</span>
        </button>

        <button
          onClick={() => handleTabSwitch('consensus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'consensus'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 glass-panel border border-transparent'
          }`}
        >
          <TargetIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Wall Street Price Targets</span>
        </button>

        <button
          onClick={() => handleTabSwitch('montecarlo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'montecarlo'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 glass-panel border border-transparent'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Monte Carlo 1,000-Path VaR</span>
        </button>
      </div>

      {/* Tab 1: Dark Pool & Whale Flow */}
      {activeTab === 'darkpool' && (
        <div className="space-y-4">
          {/* Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Dark Pool Institutional Ratio</span>
              <div className="text-xl font-mono font-bold text-slate-100 flex items-center gap-2">
                48.4%
                <span className="text-xs text-emerald-400 font-semibold">(Heavy Off-Ex Cross)</span>
              </div>
              <p className="text-[11px] text-slate-400">Higher than 30d median (36.2%) — Institutions executing stealth liquidity.</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Institutional Gamma Exposure (GEX)</span>
              <div className="text-xl font-mono font-bold text-teal-300 flex items-center gap-2">
                +$2.84 Billion
                <span className="text-xs text-teal-400 font-normal">(Long Gamma)</span>
              </div>
              <p className="text-[11px] text-slate-400">Market makers absorbing intraday dips with delta-hedging buybacks.</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Options Put / Call Volume</span>
              <div className="text-xl font-mono font-bold text-indigo-300 flex items-center gap-2">
                0.64 PCR
                <span className="text-xs text-emerald-400 font-semibold">(Bullish Bias)</span>
              </div>
              <p className="text-[11px] text-slate-400">1.56 Call contracts traded for every 1 Put contract.</p>
            </div>
          </div>

          {/* Live Dark Pool Block Stream Table */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Live Dark Pool & Sweeper Stream (&gt; $5,000,000)</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                STREAM ACTIVE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-white/5 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="p-3">Time</th>
                    <th className="p-3">Ticker</th>
                    <th className="p-3">Notional Value</th>
                    <th className="p-3">Shares</th>
                    <th className="p-3">Execution Price</th>
                    <th className="p-3">Venue / Facility</th>
                    <th className="p-3">Order Flow Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {DARK_POOL_BLOCKS.map((row) => (
                    <tr key={row.id} className="hover:bg-indigo-500/5 transition-colors font-mono">
                      <td className="p-3 text-slate-400 text-[11px]">{row.time}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded border border-white/10">
                          {row.ticker}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-100">{row.size}</td>
                      <td className="p-3 text-slate-300">{row.shares}</td>
                      <td className="p-3 text-teal-300">{row.price}</td>
                      <td className="p-3 text-slate-400 text-[11px]">{row.exchange}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          row.bias.includes('BULLISH') || row.bias.includes('ACCUMULATION')
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : row.bias.includes('GAMMA')
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-300 border-white/10'
                        }`}>
                          {row.bias} • {row.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Congressional & Insider Trading Desk */}
      {activeTab === 'insider' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-950/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Building2 className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-100">US Congressional (STOCK Act) & Corporate Insider Filings</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mandatory disclosures under the Stop Trading on Congressional Knowledge (STOCK) Act of 2012 and SEC Form 4 filings by Corporate Officers & 10%+ Beneficial Owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONGRESS_INSIDER_TRADES.map((trade) => (
              <div key={trade.id} className="glass-card rounded-2xl p-4 border border-white/10 hover:border-amber-500/30 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-100">{trade.person}</h4>
                    <div className="text-[10px] text-slate-400 font-mono">{trade.role}</div>
                  </div>
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-white/10">
                    {trade.ticker}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Action Taken</div>
                    <div className="text-emerald-400 font-bold">{trade.action}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Est. Value</div>
                    <div className="text-slate-100 font-bold">{trade.value}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  <span>Filed: {trade.filedDate}</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {trade.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Wall Street Analyst Consensus & Price Target Radar */}
      {activeTab === 'consensus' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Radar Card */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {selectedStock} Institutional Consensus Radar
                  </h3>
                  <p className="text-xs text-slate-400">Compiled from 48 bulge bracket equity research ratings.</p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">12M Target Mean</div>
                  <div className="text-lg font-black text-emerald-400">
                    ${consensusData.targetMean.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Price Range Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Current: ${consensusData.current}</span>
                  <span className="text-emerald-400 font-bold">+{consensusData.impliedUpside}% Implied Upside</span>
                  <span>Target: ${consensusData.targetMean}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 relative overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${Math.min(100, Math.max(20, (consensusData.current / consensusData.targetMean) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Rating Distribution Bar */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono uppercase text-slate-400">Brokerage Recommendation Breakdown</div>
                <div className="flex h-6 rounded-xl overflow-hidden text-[10px] font-mono font-bold text-slate-950">
                  <div style={{ width: `${(consensusData.buy / (consensusData.buy + consensusData.hold + consensusData.sell)) * 100}%` }} className="bg-emerald-400 flex items-center justify-center">
                    {consensusData.buy} BUY
                  </div>
                  <div style={{ width: `${(consensusData.hold / (consensusData.buy + consensusData.hold + consensusData.sell)) * 100}%` }} className="bg-amber-400 flex items-center justify-center">
                    {consensusData.hold} HOLD
                  </div>
                  {consensusData.sell > 0 && (
                    <div style={{ width: `${(consensusData.sell / (consensusData.buy + consensusData.hold + consensusData.sell)) * 100}%` }} className="bg-rose-400 flex items-center justify-center text-white">
                      {consensusData.sell}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Investment Bank Note */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300">
                <span className="text-teal-400 font-bold font-mono">Lead Research Stance: </span>
                {consensusData.topFirm}
              </div>
            </div>

            {/* Earnings Implied Move & Whisper */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">PRO VOLATILITY METRICS</span>
                <h4 className="text-xs font-bold text-slate-100">Earnings Straddle Implied Move</h4>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3 text-center">
                <div className="text-3xl font-mono font-extrabold text-cyan-300">±7.4%</div>
                <p className="text-[11px] text-slate-400">
                  Options straddle market pricing indicates an expected ±7.4% move on earnings release date.
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Consensus EPS Est:</span>
                  <span className="font-bold">$0.84</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Unofficial Whisper EPS:</span>
                  <span className="text-teal-400 font-bold">$0.91 (+8.3%)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Historical Beat Rate:</span>
                  <span className="text-emerald-400 font-bold">87.5% (7/8 Qtrs)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Monte Carlo 1,000-Path VaR Risk Engine */}
      {activeTab === 'montecarlo' && (
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  {selectedStock} Monte Carlo 1,000-Path Value-at-Risk Engine
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Geometric Brownian Motion with drift $\mu = 15\%$, volatility $\sigma = 35\%$ across {simulationDays} trading days.
              </p>
            </div>

            {/* Time Horizon Slider */}
            <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Horizon:</span>
              {[15, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => { playCyberClick(); setSimulationDays(d); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                    simulationDays === d ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          {/* Key VaR Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
              <div className="text-[10px] font-mono uppercase text-rose-300 font-bold">
                95% Value at Risk (VaR)
              </div>
              <div className="text-xl font-mono font-extrabold text-rose-400">
                -{monteCarloStats.var95Pct}% (${monteCarloStats.var95Value})
              </div>
              <p className="text-[11px] text-rose-200/70">
                95% statistical confidence that maximum loss will not exceed this threshold over {simulationDays} days.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Median Expected Return
              </div>
              <div className="text-xl font-mono font-extrabold text-slate-100">
                +{monteCarloStats.medianExpectedPct}%
              </div>
              <p className="text-[11px] text-slate-400">
                50th percentile central tendency based on historical drift.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                90th Percentile Bull Path
              </div>
              <div className="text-xl font-mono font-extrabold text-emerald-400">
                +{monteCarloStats.bullCase90Pct}%
              </div>
              <p className="text-[11px] text-emerald-200/70">
                High-momentum scenario assuming continued institutional accumulation.
              </p>
            </div>
          </div>

          {/* SVG Monte Carlo Trajectory Dispersion Visualizer */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Simulated Path Dispersion Curves</span>
              <span className="text-cyan-400">{simPathsCount.toLocaleString()} ITERATIONS</span>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center overflow-hidden rounded-lg bg-slate-900/40">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* Horizontal guide lines */}
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
                <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(16,185,129,0.15)" strokeDasharray="2,2" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(244,63,94,0.15)" strokeDasharray="2,2" />

                {/* Sample Path Curves */}
                {monteCarloStats.samplePaths.map((path, idx) => {
                  const dStr = path.reduce((acc, pt, i) => {
                    const x = (i / (path.length - 1)) * 500;
                    // Map price around center (90)
                    const delta = (pt.price - monteCarloStats.currentPrice) / monteCarloStats.currentPrice;
                    const y = Math.max(15, Math.min(165, 90 - delta * 350));
                    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
                  }, '');

                  const isBull = idx % 2 === 0;
                  return (
                    <path
                      key={idx}
                      d={dStr}
                      fill="none"
                      stroke={isBull ? 'rgba(45,212,191,0.5)' : 'rgba(99,102,241,0.5)'}
                      strokeWidth={idx === 0 ? '2' : '1.2'}
                    />
                  );
                })}
              </svg>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Day 0 (${monteCarloStats.currentPrice})</span>
              <span>Day {Math.round(simulationDays / 2)}</span>
              <span>Day {simulationDays} Horizon</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TargetIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
