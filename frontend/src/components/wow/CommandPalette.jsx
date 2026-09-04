import React, { useState, useEffect } from 'react';
import { Search, Plus, Zap, List, ExternalLink, X } from 'lucide-react';
import { useWatchlistStore } from '../../store/watchlistStore';
import { api } from '../../api/client';

export default function CommandPalette() {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    watchlists, 
    setActiveWatchlist, 
    addTicker, 
    simulateMarketShock 
  } = useWatchlistStore();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Search tickers
  useEffect(() => {
    if (!isCommandPaletteOpen) return;
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      api.searchTickers(query).then(res => {
        setSearchResults(res.results || []);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={() => setCommandPaletteOpen(false)} 
      />
      <div className="relative w-full max-w-xl glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-10">
        {/* Search input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-teal-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a ticker symbol, company name, or action..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
            ESC
          </kbd>
        </div>

        {/* Results / Suggestions */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Quick Actions if query empty */}
          {!query && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  simulateMarketShock('TSLA', 6.2, 3.4);
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-teal-500/10 text-slate-200 hover:text-teal-300 transition-colors text-xs group"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-400" />
                  Simulate Market Shock on TSLA (+6.2% Breakout)
                </span>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-teal-400">LIVE SHOCK</span>
              </button>

              <button
                onClick={() => {
                  simulateMarketShock('NVDA', 4.8, 2.6);
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-teal-500/10 text-slate-200 hover:text-teal-300 transition-colors text-xs group"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-400" />
                  Simulate 52-Week High Breakout on NVDA
                </span>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-teal-400">LIVE SHOCK</span>
              </button>

              <div className="px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Switch Watchlist
              </div>
              {watchlists.map(wl => (
                <button
                  key={wl.id}
                  onClick={() => {
                    setActiveWatchlist(wl.id);
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-white/5 text-slate-200 transition-colors text-xs"
                >
                  <span className="flex items-center gap-2">
                    <List className="w-4 h-4 text-slate-400" />
                    {wl.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{wl.itemsCount} tickers</span>
                </button>
              ))}
            </div>
          )}

          {/* Search matches */}
          {query && searchResults.map(item => (
            <div
              key={item.ticker}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-slate-200 transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-teal-400 w-12">{item.ticker}</span>
                <div>
                  <div className="font-medium text-slate-200">{item.name}</div>
                  <div className="text-[10px] text-slate-500">{item.sector} • ${item.basePrice}</div>
                </div>
              </div>

              <button
                onClick={async () => {
                  await addTicker(item.ticker);
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add to List
              </button>
            </div>
          ))}

          {query && searchResults.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching stocks found for "{query}". You can still type custom symbol:
              <button
                onClick={async () => {
                  await addTicker(query.toUpperCase().trim());
                  setCommandPaletteOpen(false);
                }}
                className="block mx-auto mt-2 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-mono font-semibold"
              >
                + Add "{query.toUpperCase().trim()}"
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
