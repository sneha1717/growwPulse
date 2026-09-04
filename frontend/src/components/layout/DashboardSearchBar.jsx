import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Flame, Moon, TrendingUp, TrendingDown, Zap, ArrowRight, Plus } from 'lucide-react';
import { searchFinnhubSymbols } from '../../api/finnhubClient';

export default function DashboardSearchBar({ 
  searchQuery, 
  setSearchQuery, 
  activeFilter, 
  setActiveFilter, 
  totalCount = 0, 
  attentionCount = 0, 
  quietCount = 0,
  gainersCount = 0,
  losersCount = 0,
  onSelectExternalSymbol = null
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Global hotkey '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced Finnhub symbol search when user types
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchFinnhubSymbols(trimmed);
        setSuggestions(res || []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterButtons = [
    { id: 'all', label: 'All Holdings', count: totalCount },
    { id: 'attention', label: 'Needs Attention', count: attentionCount, icon: Flame, color: 'text-amber-400' },
    { id: 'quiet', label: 'Quiet & Expected', count: quietCount, icon: Moon, color: 'text-slate-400' },
    { id: 'gainers', label: 'Gainers', count: gainersCount, icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'losers', label: 'Losers', count: losersCount, icon: TrendingDown, color: 'text-rose-400' }
  ];

  return (
    <div ref={containerRef} className="space-y-2.5 relative z-30">
      {/* Search Input Bar */}
      <div className={`relative flex items-center rounded-2xl glass-card transition-all duration-200 border ${
        isFocused ? 'border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.15)] bg-slate-900/90' : 'border-white/10 bg-slate-900/50 hover:border-white/20'
      }`}>
        <div className="pl-3.5 text-slate-400">
          <Search className={`w-4 h-4 transition-colors ${isFocused ? 'text-teal-400' : 'text-slate-400'}`} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Filter watchlist or search any stock on Finnhub (e.g. NVDA, TSLA, AAPL)..."
          className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
        />

        {searchQuery ? (
          <button
            onClick={() => { setSearchQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
            className="pr-3 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="pr-3 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-white/5">
              /
            </span>
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown from Finnhub */}
      {isFocused && (suggestions.length > 0 || isSearching) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl glass-card border border-teal-500/30 bg-slate-950/95 shadow-2xl p-2 z-50 backdrop-blur-xl">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-teal-400/80 flex items-center justify-between border-b border-white/5">
            <span>Finnhub Live Symbol Search</span>
            {isSearching && <span className="text-slate-400 animate-pulse">Searching...</span>}
          </div>

          <div className="divide-y divide-white/5 max-h-56 overflow-y-auto pt-1">
            {suggestions.map((item) => (
              <div
                key={item.symbol}
                onClick={() => {
                  if (onSelectExternalSymbol) onSelectExternalSymbol(item.symbol);
                  setSearchQuery(item.symbol);
                  setIsFocused(false);
                }}
                className="px-3 py-2 flex items-center justify-between hover:bg-teal-500/10 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs text-teal-300 group-hover:text-teal-200">
                    {item.symbol}
                  </span>
                  <span className="text-xs text-slate-400 truncate max-w-[220px] sm:max-w-md">
                    {item.description}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-teal-300 font-mono">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Filter Chips Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {filterButtons.map((btn) => {
          const isActive = activeFilter === btn.id;
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all text-xs border ${
                isActive
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-200 shadow-[0_0_12px_rgba(20,184,166,0.2)]'
                  : 'glass-panel border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${btn.color || 'text-teal-400'}`} />}
              <span>{btn.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-teal-500/30 text-teal-100 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {btn.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
