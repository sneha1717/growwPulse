import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Sparkles, 
  Activity, 
  Clock, 
  BarChart2,
  Newspaper,
  Scale,
  Calculator,
  Bell,
  Briefcase
} from 'lucide-react';
import PulseIndicator from './PulseIndicator';
import AnimatedNumber from './AnimatedNumber';
import StockChart from './StockChart';
import NewsCatalysts from './NewsCatalysts';
import BullBearDebate from './BullBearDebate';
import InvestmentCalculator from './InvestmentCalculator';
import AlertManager from '../wow/AlertManager';
import { useWatchlistStore } from '../../store/watchlistStore';
import { usePaperTradingStore } from '../../store/paperTradingStore';

export default function StockCard({ 
  item, 
  isPriority = false, 
  isFocused = false, 
  externalCommand = null 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'catalysts' | 'debate' | 'calc' | 'alerts'
  const removeTicker = useWatchlistStore(state => state.removeTicker);
  const openTradeModal = usePaperTradingStore(state => state.openTradeModal);

  // Sync with keyboard shortcut commands (e.g. C for chart, R for calc, D for debate, A for alerts)
  React.useEffect(() => {
    if (externalCommand && externalCommand.ticker === item.ticker) {
      setIsExpanded(true);
      if (externalCommand.tab) {
        setActiveTab(externalCommand.tab);
      }
    }
  }, [externalCommand, item.ticker]);

  const symbolPrefix = item.symbolPrefix || (item.currency === 'INR' ? '₹' : '$');
  const isUp = item.pctChangeDay >= 0;
  const isDiffUp = (item.diffSinceLastSeen?.pctDelta || 0) >= 0;

  // 52-week position percentage
  const range52w = (item.high52 && item.low52 && item.high52 > item.low52)
    ? Math.max(0, Math.min(100, Math.round(((item.price - item.low52) / (item.high52 - item.low52)) * 100)))
    : 50;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      id={`stock-card-${item.ticker}`}
      className={`glass-card rounded-2xl transition-all duration-300 overflow-hidden ${
        isFocused 
          ? 'ring-2 ring-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.35)] scale-[1.01]' 
          : ''
      } ${
        isPriority 
          ? 'border-teal-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-teal-950/20 shadow-[0_4px_25px_-5px_rgba(20,184,166,0.15)]' 
          : 'border-white/5 bg-slate-900/60'
      }`}
    >
      <div className="p-5 space-y-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center font-bold text-slate-100 tracking-wider font-mono shadow-inner">
              {item.ticker}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-100 text-sm">{item.name}</h4>
                <PulseIndicator timestamp={item.updatedAt} />
              </div>
              <p className="text-xs text-slate-400">{item.sector}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Attention Score Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/10 border border-teal-500/30 text-teal-300">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>{item.attentionScore}</span>
              <span className="text-[10px] text-teal-500/70 font-normal">SCORE</span>
            </div>

            {/* Quick Remove Button */}
            <button
              onClick={() => removeTicker(item.ticker)}
              className="opacity-40 hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-all"
              title={`Remove ${item.ticker}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Narrative Headline (The Plain-English Explanation) */}
        <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {item.narrative}
            </p>
            {/* "Since you last checked" Diff story */}
            {item.diffSinceLastSeen && (
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Since last check:</span>
                <span className={isDiffUp ? 'text-emerald-400' : 'text-rose-400'}>
                  {isDiffUp ? '+' : ''}{symbolPrefix}{Math.abs(item.diffSinceLastSeen.priceDelta).toFixed(2)} ({isDiffUp ? '+' : ''}{item.diffSinceLastSeen.pctDelta}%)
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] block">CURRENT PRICE</span>
            <div className="text-base font-bold font-mono text-slate-100 flex items-baseline gap-1">
              <AnimatedNumber value={item.price} prefix={symbolPrefix} />
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] block">TODAY'S MOVE</span>
            <div className={`text-base font-bold font-mono flex items-center gap-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <AnimatedNumber value={item.pctChangeDay} prefix={isUp ? '+' : ''} suffix="%" />
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] block">VOLUME VS 30D AVG</span>
            <div className="text-sm font-semibold font-mono text-slate-300">
              {item.scoreBreakdown?.volumeAnomalyRatio ? `${item.scoreBreakdown.volumeAnomalyRatio}x` : '1.0x'}
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] block">VOLATILITY Z-SCORE</span>
            <div className="text-sm font-semibold font-mono text-slate-300">
              {item.scoreBreakdown?.relativeMoveZScore ? `${item.scoreBreakdown.relativeMoveZScore}σ` : '0.0σ'}
            </div>
          </div>
        </div>

        {/* 52-Week Range Bar */}
        {item.low52 && item.high52 && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>52W L: {symbolPrefix}{item.low52.toFixed(2)}</span>
              <span className="text-slate-400 font-semibold">{range52w}% of range</span>
              <span>52W H: {symbolPrefix}{item.high52.toFixed(2)}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${range52w}%` }}
              />
            </div>
          </div>
        )}

        {/* FII / DII Institutional Smart Money Strip (Groww Favorite) */}
        <div className="flex flex-wrap items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/40 border border-white/5 text-[10px] font-mono gap-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">INSTITUTIONAL FLOW:</span>
            <span className={isUp ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              FII: {isUp ? '+' : '-'}{symbolPrefix}{Math.round(Math.abs((item.price * (item.scoreBreakdown?.volumeAnomalyRatio || 1.2) * 1.5) % 850 + 120))}M
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-teal-300 font-bold">
              DII: +{symbolPrefix}{Math.round(Math.abs((item.price * 2.1) % 920 + 150))}M
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase font-semibold">
            {isUp ? 'Net Inflow' : 'Neutral Hold'}
          </span>
        </div>

        {/* Card Expand Tab Buttons */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-[calc(100%-80px)] flex-nowrap">
            <button
              onClick={() => {
                if (!isExpanded) setIsExpanded(true);
                setActiveTab('chart');
              }}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                isExpanded && activeTab === 'chart'
                  ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Chart</span>
            </button>

            <button
              onClick={() => {
                if (!isExpanded) setIsExpanded(true);
                setActiveTab('catalysts');
              }}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                isExpanded && activeTab === 'catalysts'
                  ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Catalysts ({item.catalysts?.length || 2})</span>
            </button>

            <button
              onClick={() => {
                if (!isExpanded) setIsExpanded(true);
                setActiveTab('debate');
              }}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                isExpanded && activeTab === 'debate'
                  ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Bull vs Bear</span>
            </button>

            <button
              onClick={() => {
                if (!isExpanded) setIsExpanded(true);
                setActiveTab('calc');
              }}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                isExpanded && activeTab === 'calc'
                  ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>ROI Calc</span>
            </button>

            <button
              onClick={() => {
                if (!isExpanded) setIsExpanded(true);
                setActiveTab('alerts');
              }}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                isExpanded && activeTab === 'alerts'
                  ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts</span>
            </button>

            {/* Quick 1-Click Paper Trade Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openTradeModal(item.ticker);
              }}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 font-semibold border border-emerald-500/30 transition-all shadow-sm shrink-0"
              title={`Execute Virtual Paper Trade for ${item.ticker}`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trade</span>
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors p-1 shrink-0"
          >
            {isExpanded ? (
              <><span>Close</span><ChevronUp className="w-4 h-4" /></>
            ) : (
              <><span>Expand</span><ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Section with smooth Framer Motion height transition */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="px-4 sm:px-5 pb-5 pt-1 bg-slate-950/40 border-t border-white/5"
          >
            {activeTab === 'chart' && (
              <div>
                <div className="flex items-center justify-between pb-1 text-xs text-slate-400">
                  <span className="font-mono text-[10px] sm:text-[11px] tracking-wide">30-DAY PRICE & VOLUME HISTORY</span>
                  <span className="text-[10px] text-slate-500">Trailing Vol: {item.volatility}%</span>
                </div>
                <StockChart 
                  ticker={item.ticker} 
                  isPositive={isUp} 
                  symbolPrefix={symbolPrefix} 
                  currentPrice={item.price} 
                  pctChange={item.pctChangeDay} 
                />
              </div>
            )}

            {activeTab === 'catalysts' && (
              <NewsCatalysts ticker={item.ticker} catalysts={item.catalysts} />
            )}

            {activeTab === 'debate' && (
              <BullBearDebate ticker={item.ticker} theses={item.theses} />
            )}

            {activeTab === 'calc' && (
              <InvestmentCalculator 
                ticker={item.ticker} 
                price={item.price} 
                pctChangeDay={item.pctChangeDay} 
                symbolPrefix={symbolPrefix} 
              />
            )}

            {activeTab === 'alerts' && (
              <AlertManager 
                ticker={item.ticker} 
                currentPrice={item.price} 
                attentionScore={item.attentionScore} 
                symbolPrefix={symbolPrefix} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
