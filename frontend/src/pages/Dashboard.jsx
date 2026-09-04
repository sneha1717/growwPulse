import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Flame, 
  RefreshCw, 
  Plus, 
  Zap, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Grid,
  Sliders,
  AlertOctagon,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import AmbientBackground from '../components/layout/AmbientBackground';
import TickerTape from '../components/layout/TickerTape';
import StockCard from '../components/feed/StockCard';
import QuietSection from '../components/feed/QuietSection';
import HealthScoreGauge from '../components/wow/HealthScoreGauge';
import TimelineScrubber from '../components/wow/TimelineScrubber';
import CorrelationHeatmap from '../components/wow/CorrelationHeatmap';
import CommandPalette from '../components/wow/CommandPalette';
import ShareSnapshotModal from '../components/wow/ShareSnapshotModal';
import AudioBriefing from '../components/wow/AudioBriefing';
import AlgorithmTuner from '../components/wow/AlgorithmTuner';
import MarketPsychologyMeter from '../components/wow/MarketPsychologyMeter';
import TriagePrescriptions from '../components/wow/TriagePrescriptions';
import KeyboardShortcutsModal from '../components/wow/KeyboardShortcutsModal';
import MorningMemoModal from '../components/wow/MorningMemoModal';
import StressTestModal, { STRESS_SCENARIOS } from '../components/wow/StressTestModal';
import StockDuel from '../components/duel/StockDuel';
import PaperTrading from '../components/paper/PaperTrading';
import AICoPilotDrawer from '../components/copilot/AICoPilotDrawer';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/EmptyState';
import PulseIndicator from '../components/feed/PulseIndicator';
import { useWatchlistStore } from '../store/watchlistStore';
import { usePaperTradingStore } from '../store/paperTradingStore';

export default function Dashboard() {
  const {
    watchlists,
    activeWatchlistId,
    setActiveWatchlist,
    feedData,
    healthData,
    timelineSlices,
    selectedTimelineId,
    algorithmWeights,
    setAlgorithmWeights,
    resetAlgorithmWeights,
    isLoading,
    isRefreshing,
    loadWatchlistData,
    setCommandPaletteOpen,
    simulateMarketShock
  } = useWatchlistStore();

  const [activeWorkspace, setActiveWorkspace] = useState('triage'); // 'triage' | 'duel' | 'paper'
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isHeatmapModalOpen, setIsHeatmapModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isStressModalOpen, setIsStressModalOpen] = useState(false);
  const [activeStressScenario, setActiveStressScenario] = useState(null);
  const [stressedFeed, setStressedFeed] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedTicker, setFocusedTicker] = useState(null);
  const [cardCommand, setCardCommand] = useState(null);
  const [forceQuietOpen, setForceQuietOpen] = useState(false);
  const [hotkeyToast, setHotkeyToast] = useState(null);

  const updateMarketPrices = usePaperTradingStore(state => state.updateMarketPrices);

  // Trigger immediate live fetch on mount & poll for latest data every 20 seconds while on dashboard
  useEffect(() => {
    if (!activeWatchlistId) return;
    loadWatchlistData(activeWatchlistId, true);
    const interval = setInterval(() => {
      loadWatchlistData(activeWatchlistId, true);
    }, 20000);
    return () => clearInterval(interval);
  }, [activeWatchlistId, loadWatchlistData]);

  // Determine active feed data: either live feed, stressed simulation feed, or selected historical timeline slice
  let currentFeed = feedData;
  if (stressedFeed) {
    currentFeed = stressedFeed;
  } else if (selectedTimelineId !== 'now' && timelineSlices.length > 0) {
    const slice = timelineSlices.find(s => s.id === selectedTimelineId);
    if (slice && slice.feed) {
      currentFeed = slice.feed;
    }
  }

  const activeWl = watchlists.find(w => w.id === activeWatchlistId) || { name: 'Watchlist', description: '' };
  const needsAttention = currentFeed?.needsAttention || [];
  const quiet = currentFeed?.quiet || [];
  const allItems = [...needsAttention, ...quiet];
  const isEmpty = !currentFeed || (needsAttention.length === 0 && quiet.length === 0);

  // Sync market prices into paper trading store
  useEffect(() => {
    if (allItems.length > 0) {
      updateMarketPrices(allItems);
    }
  }, [allItems, updateMarketPrices]);

  const showHotkeyFeedback = (keyName, msg) => {
    setHotkeyToast({ key: keyName, message: msg });
    setTimeout(() => setHotkeyToast(null), 2500);
  };

  const handleApplyStressScenario = (scenarioKey, impactedItems) => {
    setActiveStressScenario(scenarioKey);
    const itemMap = new Map(impactedItems.map(i => [i.ticker, i]));

    const updateItem = (item) => {
      const impacted = itemMap.get(item.ticker);
      if (!impacted) return item;
      const originalPrice = item.price;
      const newPrice = impacted.stressedPrice;
      const deltaPct = impacted.deltaPct;
      const newChangePct = parseFloat(((item.changePct || 0) + deltaPct).toFixed(2));
      const newChange = parseFloat(((item.change || 0) + (originalPrice * deltaPct / 100)).toFixed(2));
      const newAttentionScore = Math.min(99, Math.max(15, Math.round((item.attentionScore || 50) + Math.abs(deltaPct) * 3.5)));

      return {
        ...item,
        price: newPrice,
        change: newChange,
        changePct: newChangePct,
        attentionScore: newAttentionScore,
        isStressed: true,
        stressDelta: deltaPct
      };
    };

    const stressedNeeds = (feedData?.needsAttention || []).map(updateItem);
    const stressedQuiet = (feedData?.quiet || []).map(updateItem);

    // Re-triage: if an item in quiet suffered high delta (|delta| >= 4), elevate it into needsAttention!
    const elevatedFromQuiet = stressedQuiet.filter(i => Math.abs(i.stressDelta || 0) >= 4);
    const remainingQuiet = stressedQuiet.filter(i => Math.abs(i.stressDelta || 0) < 4);

    const finalNeedsAttention = [...stressedNeeds, ...elevatedFromQuiet].sort((a, b) => b.attentionScore - a.attentionScore);

    setStressedFeed({
      ...feedData,
      needsAttention: finalNeedsAttention,
      quiet: remainingQuiet,
      isStressedSimulation: true,
      stressedScenario: STRESS_SCENARIOS[scenarioKey]
    });

    showHotkeyFeedback('T', `Shock: ${STRESS_SCENARIOS[scenarioKey]?.title || scenarioKey}`);
  };

  const handleClearStressScenario = () => {
    setActiveStressScenario(null);
    setStressedFeed(null);
    showHotkeyFeedback('T', 'Reverted to live market feed');
  };

  const handleSelectTickerFromTape = (ticker) => {
    setFocusedTicker(ticker);
    const el = document.getElementById(`stock-card-${ticker}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-teal-400');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-teal-400');
      }, 1500);
    }
  };

  // Vim-style Bloomberg Terminal Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMemoModalOpen(prev => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsStressModalOpen(prev => !prev);
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setActiveWorkspace(prev => prev === 'triage' ? 'duel' : prev === 'duel' ? 'paper' : 'triage');
        showHotkeyFeedback('W', 'Switched Workspace Mode');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setIsCopilotOpen(prev => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        simulateMarketShock('TSLA', 5.5, 3.2);
        showHotkeyFeedback('S', 'Simulated +5.5% shock on TSLA');
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (allItems.length === 0) return;
        setFocusedIndex(prev => {
          const next = (prev + 1) % allItems.length;
          const target = allItems[next];
          if (target) {
            setFocusedTicker(target.ticker);
            if (quiet.some(q => q.ticker === target.ticker)) setForceQuietOpen(true);
            handleSelectTickerFromTape(target.ticker);
            showHotkeyFeedback('J', `Focused ${target.ticker}`);
          }
          return next;
        });
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (allItems.length === 0) return;
        setFocusedIndex(prev => {
          const next = prev <= 0 ? allItems.length - 1 : prev - 1;
          const target = allItems[next];
          if (target) {
            setFocusedTicker(target.ticker);
            if (quiet.some(q => q.ticker === target.ticker)) setForceQuietOpen(true);
            handleSelectTickerFromTape(target.ticker);
            showHotkeyFeedback('K', `Focused ${target.ticker}`);
          }
          return next;
        });
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (allItems.length === 0) return;
        const target = focusedTicker || allItems[0]?.ticker;
        if (target) {
          setFocusedTicker(target);
          if (quiet.some(q => q.ticker === target)) setForceQuietOpen(true);
          setCardCommand({ ticker: target, tab: 'chart', ts: Date.now() });
          handleSelectTickerFromTape(target);
          showHotkeyFeedback('C', `Opened Candlestick / Area Chart for ${target}`);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (allItems.length === 0) return;
        const target = focusedTicker || allItems[0]?.ticker;
        if (target) {
          setFocusedTicker(target);
          if (quiet.some(q => q.ticker === target)) setForceQuietOpen(true);
          setCardCommand({ ticker: target, tab: 'calc', ts: Date.now() });
          handleSelectTickerFromTape(target);
          showHotkeyFeedback('R', `Opened Groww SIP / ROI Calculator for ${target}`);
        }
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (allItems.length === 0) return;
        const target = focusedTicker || allItems[0]?.ticker;
        if (target) {
          setFocusedTicker(target);
          if (quiet.some(q => q.ticker === target)) setForceQuietOpen(true);
          setCardCommand({ ticker: target, tab: 'debate', ts: Date.now() });
          handleSelectTickerFromTape(target);
          showHotkeyFeedback('D', `Opened Bull vs. Bear Debate for ${target}`);
        }
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (allItems.length === 0) return;
        const target = focusedTicker || allItems[0]?.ticker;
        if (target) {
          setFocusedTicker(target);
          if (quiet.some(q => q.ticker === target)) setForceQuietOpen(true);
          setCardCommand({ ticker: target, tab: 'alerts', ts: Date.now() });
          handleSelectTickerFromTape(target);
          showHotkeyFeedback('A', `Opened Smart Alerts for ${target}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allItems, focusedTicker, quiet, simulateMarketShock]);

  return (
    <div className="relative min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col selection:bg-teal-500/30 selection:text-teal-200">
      <AmbientBackground />
      <Navbar 
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        onOpenHeatmap={() => setIsHeatmapModalOpen(true)} 
        onOpenMemo={() => setIsMemoModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenStress={() => setIsStressModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Floating Hotkey Action Toast */}
      {hotkeyToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="px-4 py-2 rounded-full glass-panel border border-teal-400 bg-slate-900/90 shadow-[0_0_25px_rgba(20,184,166,0.4)] flex items-center gap-2.5 text-xs text-teal-200 font-mono">
            <kbd className="px-2 py-0.5 rounded bg-teal-400 text-slate-950 font-bold text-[11px] shadow">
              {hotkeyToast.key}
            </kbd>
            <span>{hotkeyToast.message}</span>
          </div>
        </div>
      )}

      {/* Idea 4: Live Marquee Ticker Tape */}
      {allItems.length > 0 && (
        <TickerTape
          items={allItems}
          onSelectTicker={handleSelectTickerFromTape}
        />
      )}

      <main className="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-6 pt-4 pb-24 md:pb-8 space-y-5 sm:space-y-6 flex-1">
        {/* Dual Market Quick Switcher Pills (US Wall Street vs Indian Nifty 50) */}
        {watchlists.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold tracking-wider mr-1 shrink-0">
              Active Market:
            </span>
            {watchlists.map(wl => {
              const isNifty = wl.name.includes('Nifty') || wl.name.includes('Groww') || wl.name.includes('NSE');
              const isTech = wl.name.includes('Tech') || wl.name.includes('AI');
              const isSelected = wl.id === activeWatchlistId;

              return (
                <button
                  key={wl.id}
                  onClick={() => setActiveWatchlist(wl.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                      : 'glass-panel text-slate-400 hover:text-slate-200 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">
                    {isNifty ? '🇮🇳' : isTech ? '🇺🇸' : '⚡'}
                  </span>
                  <span>{wl.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400'}`}>
                    {wl.itemsCount || wl.itemCount || 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Black Swan Macro Stress Test Banner */}
        {activeStressScenario && STRESS_SCENARIOS[activeStressScenario] && (
          <div className="glass-panel border-2 border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-amber-950/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(244,63,94,0.18)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                    MACRO SHOCK SIMULATION
                  </span>
                  <h3 className="text-sm font-black text-slate-100">
                    {STRESS_SCENARIOS[activeStressScenario].title}
                  </h3>
                </div>
                <p className="text-xs text-rose-200/80 mt-0.5 max-w-2xl">
                  Simulating crisis shock across prices, covariance drawdowns, and triage priority.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsStressModalOpen(true)}
                className="text-xs font-semibold"
              >
                Change Shock
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleClearStressScenario}
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert to Live Feed</span>
              </Button>
            </div>
          </div>
        )}

        {/* Watchlist Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-white/10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                {activeWl.name}
              </h1>
              {feedData && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-white/10 text-[11px] font-mono">
                  <PulseIndicator timestamp={feedData.lastSuccessfulFetchAt || feedData.asOf} />
                  <span className="text-slate-300 font-medium">
                    {feedData.finnhub?.fetchStatus === 'LIVE_FINNHUB'
                      ? `LIVE as of ${feedData.lastSuccessfulFetchFormatted}`
                      : feedData.isDataDelayed
                      ? `DELAYED as of ${feedData.lastSuccessfulFetchFormatted}`
                      : `SIMULATED as of ${feedData.lastSuccessfulFetchFormatted}`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({feedData.finnhub?.feedSourceLabel || 'Feed'})
                  </span>
                </div>
              )}
              {feedData?.isDataDelayed && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  <AlertCircle className="w-3 h-3 text-amber-400" /> DATA DELAYED (RATE LIMIT ACTIVE)
                </span>
              )}
              {feedData?.isStale && !feedData?.isDataDelayed && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <AlertCircle className="w-3 h-3" /> STALE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              {activeWl.description || 'Continuous triage of abnormal relative moves, volume anomalies, and level crossings.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Idea 1: Audio Briefing (30s Voice Synthesized Podcast) */}
            <AudioBriefing
              watchlistName={activeWl.name}
              healthScore={healthData}
              needsAttention={needsAttention}
              quietCount={quiet.length}
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => activeWatchlistId && loadWatchlistData(activeWatchlistId, true)}
              isLoading={isRefreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Add Ticker
            </Button>
          </div>
        </div>

        {/* Workspace 2: Stock Duel Studio */}
        {activeWorkspace === 'duel' && (
          <StockDuel items={allItems} />
        )}

        {/* Workspace 3: Paper Trading Virtual Portfolio */}
        {activeWorkspace === 'paper' && (
          <PaperTrading allTickers={allItems} />
        )}

        {/* Workspace 1: Triage Feed (Default Core) */}
        {activeWorkspace === 'triage' && (
          <>
            {/* Timeline Scrubber */}
            {timelineSlices.length > 0 && (
              <TimelineScrubber slices={timelineSlices} />
            )}

        {/* Idea 2: Interactive Attention Score Weight Tuner */}
        <AlgorithmTuner
          weights={algorithmWeights}
          onWeightsChange={setAlgorithmWeights}
          onReset={resetAlgorithmWeights}
        />

        {/* Watchlist Health Score Gauge & Retail Psychology Barometer */}
        {healthData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <HealthScoreGauge health={healthData} />
            </div>
            <div className="space-y-4">
              <MarketPsychologyMeter items={allItems} />
              <div className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold block">
                    INSTANT ACTIONS
                  </span>
                  <h4 className="text-xs font-bold text-slate-100">Trade Desk Tools</h4>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setIsHeatmapModalOpen(true)}
                  >
                    <Grid className="w-3.5 h-3.5 text-teal-400" />
                    <span>Inspect Correlation Matrix</span>
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => simulateMarketShock('TSLA', 5.5, 3.2)}
                  >
                    <Zap className="w-3.5 h-3.5 text-white" />
                    <span>Simulate Market Surge (+5.5% on TSLA)</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && isEmpty && (
          <EmptyState />
        )}

        {/* Main Feed: "Needs your attention" */}
        {!isLoading && !isEmpty && (
          <div className="space-y-6">
            {/* Feature 3: Actionable 3-Bullet Triage Prescriptions */}
            <TriagePrescriptions needsAttention={needsAttention} quiet={quiet} />

            {/* Needs Attention Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-teal-500/20 text-teal-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                    Needs Your Attention
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {needsAttention.length} FLAGGED
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Surfaced by Attention Score: volatility z-scores, volume surges, and level breakthroughs.
                  </p>
                </div>
              </div>
            </div>

            {/* Needs Attention Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {needsAttention.map((item) => (
                <StockCard 
                  key={item.ticker} 
                  item={item} 
                  isPriority={true} 
                  isFocused={focusedTicker === item.ticker}
                  externalCommand={cardCommand}
                />
              ))}
            </div>

            {/* Quiet & Expected Collapsed Section */}
            <QuietSection 
              items={quiet} 
              focusedTicker={focusedTicker}
              externalCommand={cardCommand}
              forceOpen={forceQuietOpen}
            />
          </div>
        )}
          </>
        )}
      </main>

      {/* Correlation Heatmap Modal */}
      <Modal
        isOpen={isHeatmapModalOpen}
        onClose={() => setIsHeatmapModalOpen(false)}
        title="Cross-Asset Correlation Matrix"
        maxWidth="max-w-3xl"
      >
        {activeWatchlistId && (
          <CorrelationHeatmap watchlistId={activeWatchlistId} />
        )}
      </Modal>

      {/* Feature 4: Bloomberg Terminal Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Feature 5: Executive Morning Memo Printable PDF Modal */}
      <MorningMemoModal
        isOpen={isMemoModalOpen}
        onClose={() => setIsMemoModalOpen(false)}
        watchlistName={activeWl.name}
        feedData={currentFeed}
        healthData={healthData}
      />

      {/* Show-Stopping Feature: Black Swan Macro Scenario Stress Tester */}
      <StressTestModal
        isOpen={isStressModalOpen}
        onClose={() => setIsStressModalOpen(false)}
        feedData={feedData}
        onApplyScenario={handleApplyStressScenario}
        onClearScenario={handleClearStressScenario}
        activeScenarioId={activeStressScenario}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Share Snapshot Modal */}
      <ShareSnapshotModal />

      {/* Pulse AI Desk Co-Pilot Slide-Over Drawer */}
      <AICoPilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        feedData={currentFeed}
        healthData={healthData}
        onSelectWorkspace={setActiveWorkspace}
      />
    </div>
  );
}
