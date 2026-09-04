import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import StockCard from './StockCard';

export default function QuietSection({ 
  items = [], 
  focusedTicker = null, 
  externalCommand = null, 
  forceOpen = false 
}) {
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      {/* Quiet Section Banner & Header Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-xl glass-panel hover:bg-slate-900/80 transition-all border border-white/5 group text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-300 group-hover:text-slate-100">
                Quiet & Expected
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                {items.length} STOCKS
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Trading within normal historical volatility and expected volume envelopes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 group-hover:text-slate-200">
          <span>{isOpen ? 'Collapse quiet list' : 'View all quiet stocks'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Quiet Stocks Grid */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 pt-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => (
                <StockCard 
                  key={item.ticker} 
                  item={item} 
                  isPriority={false}
                  isFocused={focusedTicker === item.ticker}
                  externalCommand={externalCommand}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
