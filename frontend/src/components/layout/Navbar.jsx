import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Plus, 
  Share2, 
  Grid, 
  Zap, 
  LogOut, 
  ChevronDown, 
  Trash2,
  FolderPlus,
  FileText,
  Terminal,
  AlertOctagon,
  Swords,
  Briefcase,
  Bot
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import ThemeToggle from './ThemeToggle';
import { useAuthStore } from '../../store/authStore';
import { useWatchlistStore } from '../../store/watchlistStore';

export default function Navbar({ 
  activeWorkspace = 'triage', 
  setActiveWorkspace, 
  onOpenHeatmap, 
  onOpenMemo, 
  onOpenShortcuts, 
  onOpenStress,
  onOpenCopilot
}) {
  const { user, logout } = useAuthStore();
  const { 
    watchlists, 
    activeWatchlistId, 
    setActiveWatchlist, 
    createWatchlist, 
    deleteWatchlist,
    setCommandPaletteOpen,
    setShareModalOpen,
    simulateMarketShock,
    isRefreshing
  } = useWatchlistStore();

  const [isWlDropdownOpen, setIsWlDropdownOpen] = useState(false);
  const [isNewWlModalOpen, setIsNewWlModalOpen] = useState(false);
  const [newWlName, setNewWlName] = useState('');
  const [newWlDesc, setNewWlDesc] = useState('');

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || { name: 'Select Watchlist' };

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    if (!newWlName.trim()) return;
    await createWatchlist(newWlName.trim(), newWlDesc.trim(), ['NVDA', 'TSLA', 'AAPL']);
    setNewWlName('');
    setNewWlDesc('');
    setIsNewWlModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0E17]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.35)]">
                <Activity className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-teal-300 via-white to-violet-300 bg-clip-text text-transparent">
                  PULSE
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-teal-400/80 ml-2 tracking-widest uppercase">
                  TRIAGE FEED
                </span>
              </div>
            </div>

            {/* Watchlist Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsWlDropdownOpen(!isWlDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel hover:bg-slate-800/80 text-xs font-semibold text-slate-200 border border-white/10 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="max-w-[140px] truncate">{activeWatchlist.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isWlDropdownOpen && (
                <div className="absolute top-full mt-1.5 left-0 w-64 glass-panel rounded-2xl border border-white/10 p-2 shadow-2xl z-50 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1">
                    Your Watchlists
                  </div>
                  {watchlists.map(wl => (
                    <div
                      key={wl.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                        wl.id === activeWatchlistId ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-white/5'
                      }`}
                      onClick={() => {
                        setActiveWatchlist(wl.id);
                        setIsWlDropdownOpen(false);
                      }}
                    >
                      <div className="truncate">
                        <div>{wl.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{wl.itemsCount} tickers</div>
                      </div>
                      {watchlists.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWatchlist(wl.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        setIsWlDropdownOpen(false);
                        setIsNewWlModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-teal-400 hover:bg-teal-500/10 font-medium transition-colors"
                    >
                      <FolderPlus className="w-3.5 h-3.5" /> New Watchlist...
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workspace Switcher Pills */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/5 font-semibold text-xs shadow-inner">
            <button
              onClick={() => setActiveWorkspace && setActiveWorkspace('triage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeWorkspace === 'triage'
                  ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Triage Feed</span>
            </button>

            <button
              onClick={() => setActiveWorkspace && setActiveWorkspace('duel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeWorkspace === 'duel'
                  ? 'bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-violet-400" />
              <span>Stock Duel</span>
            </button>

            <button
              onClick={() => setActiveWorkspace && setActiveWorkspace('paper')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeWorkspace === 'paper'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paper Trader</span>
            </button>
          </div>

          {/* Center Search & Cmd+K Pill */}
          <div className="hidden xl:flex items-center">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-3 px-4 py-1.5 rounded-xl glass-panel text-xs text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all border border-white/5"
            >
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span>Search stocks or actions...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons & User */}
          <div className="flex items-center gap-2.5">
            {/* Instant Market Shock Demo Button for Judges */}
            <button
              onClick={() => simulateMarketShock('TSLA', 5.8, 3.1)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)]"
              title="Simulate sudden market move on TSLA to test Attention Score triage"
            >
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span>Simulate Shock</span>
            </button>

            {/* Correlation Heatmap Button */}
            <button
              onClick={onOpenHeatmap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel hover:bg-slate-800 text-xs font-medium text-slate-300 border border-white/10 transition-all"
              title="View correlation heatmap"
            >
              <Grid className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Correlation</span>
            </button>

            {/* Black Swan Macro Stress Test Modal Button */}
            <button
              onClick={onOpenStress}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              title="Macro Black Swan & Scenario Stress Tester"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Stress Test</span>
            </button>

            {/* Morning Memo Printable PDF Button */}
            <button
              onClick={onOpenMemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel hover:bg-slate-800 text-xs font-medium text-teal-300 border border-teal-500/20 hover:border-teal-500/40 transition-all shadow-sm"
              title="Open executive printable Morning Memo (PDF)"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">Morning Memo</span>
            </button>

            {/* Pulse AI Trade Desk Co-Pilot Trigger */}
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/10 via-violet-500/10 to-teal-500/10 text-teal-300 border border-teal-500/30 hover:border-teal-400/60 text-xs font-bold transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)] group"
              title="Pulse AI Trade Desk Co-Pilot"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <Bot className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">AI Co-Pilot</span>
            </button>

            {/* Display Theme Switcher: Midnight Cyber / Groww Emerald / Bloomberg Amber */}
            <ThemeToggle />

            {/* Keyboard Shortcuts Button */}
            <button
              onClick={onOpenShortcuts}
              className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 border border-white/10 transition-all"
              title="Bloomberg Terminal Keyboard Shortcuts (?)"
            >
              <Terminal className="w-4 h-4 text-slate-400" />
            </button>

            {/* Share Snapshot Button */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 border border-white/10 transition-all"
              title="Share Watchlist Snapshot"
            >
              <Share2 className="w-4 h-4 text-slate-300" />
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/5">
              <span className="hidden xl:inline text-xs text-slate-400 font-mono">
                {user?.name || 'Trader'}
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Create Watchlist Modal */}
      <Modal
        isOpen={isNewWlModalOpen}
        onClose={() => setIsNewWlModalOpen(false)}
        title="Create New Named Watchlist"
      >
        <form onSubmit={handleCreateWatchlist} className="space-y-4">
          <Input
            label="Watchlist Name"
            placeholder="e.g., AI Semiconductors, Breakout Bets"
            value={newWlName}
            onChange={(e) => setNewWlName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Description (Optional)"
            placeholder="e.g., Core basket of chip designers and foundry plays"
            value={newWlDesc}
            onChange={(e) => setNewWlDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsNewWlModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Watchlist
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
