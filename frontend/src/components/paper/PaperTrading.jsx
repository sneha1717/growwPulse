import React, { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  RotateCcw, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Zap,
  Percent
} from 'lucide-react';
import { usePaperTradingStore } from '../../store/paperTradingStore';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

export default function PaperTrading({ allTickers = [] }) {
  const {
    cash,
    initialCapital,
    currencyPrefix,
    holdings,
    trades,
    realizedPnL,
    winningTrades,
    totalClosedTrades,
    buyStock,
    sellStock,
    resetPortfolio,
    isTradeModalOpen,
    openTradeModal,
    closeTradeModal,
    selectedTradeTicker
  } = usePaperTradingStore();

  // Trade Modal State
  const [modalTicker, setModalTicker] = useState(selectedTradeTicker || allTickers[0]?.ticker || 'RELIANCE');
  const [tradeType, setTradeType] = useState('BUY'); // 'BUY' or 'SELL'
  const [sharesInput, setSharesInput] = useState('20');
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');

  // Calculate portfolio totals
  const holdingsValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
  const totalPortfolioValue = cash + holdingsValue;
  const totalCostBasis = holdings.reduce((sum, h) => sum + (h.shares * h.avgBuyPrice), 0);
  const unrealizedPnL = holdingsValue - totalCostBasis;
  const netTotalPnL = unrealizedPnL + realizedPnL;
  const netReturnPct = initialCapital > 0 ? parseFloat(((netTotalPnL / initialCapital) * 100).toFixed(2)) : 0;
  
  // Benchmark comparison: simulate benchmark index at +1.2%
  const benchmarkReturnPct = 1.20;
  const alphaVsBenchmark = parseFloat((netReturnPct - benchmarkReturnPct).toFixed(2));
  const winRatePct = totalClosedTrades > 0 ? Math.round((winningTrades / totalClosedTrades) * 100) : 75;

  const currentActiveTickerData = allTickers.find(t => t.ticker === modalTicker) || {
    ticker: modalTicker,
    price: 150.00,
    symbolPrefix: currencyPrefix
  };

  const handleOpenNewTrade = (ticker = null, type = 'BUY') => {
    setModalTicker(ticker || allTickers[0]?.ticker || 'RELIANCE');
    setTradeType(type);
    setSharesInput('10');
    setTradeError('');
    setTradeSuccess('');
    openTradeModal(ticker);
  };

  const handleExecuteTrade = (e) => {
    e.preventDefault();
    setTradeError('');
    setTradeSuccess('');

    const shares = parseInt(sharesInput, 10);
    const price = currentActiveTickerData.price;
    const prefix = currentActiveTickerData.symbolPrefix || currencyPrefix;

    if (tradeType === 'BUY') {
      const res = buyStock(modalTicker, shares, price, prefix, 'Triage Desk Execution');
      if (!res.success) {
        setTradeError(res.error);
        return;
      }
      setTradeSuccess(`Successfully bought ${shares} shares of ${modalTicker} at ${prefix}${price}`);
    } else {
      const res = sellStock(modalTicker, shares, price);
      if (!res.success) {
        setTradeError(res.error);
        return;
      }
      const pnlText = res.profit >= 0 ? `+${prefix}${res.profit.toFixed(2)}` : `-${prefix}${Math.abs(res.profit).toFixed(2)}`;
      setTradeSuccess(`Successfully sold ${shares} shares of ${modalTicker} (${pnlText} P&L)`);
    }

    setTimeout(() => {
      closeTradeModal();
      setTradeSuccess('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-100 tracking-tight">
                  Triage Alpha — Virtual Paper Trading Desk
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                  LIVE SIMULATOR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute virtual trades based on real-time Attention Score signals with zero risk.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={resetPortfolio}
              className="text-xs font-semibold"
              title="Reset portfolio back to initial virtual capital"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Capital</span>
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => handleOpenNewTrade()}
              className="text-xs font-semibold shadow-lg shadow-teal-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Order</span>
            </Button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Portfolio Value */}
          <div className="glass-card rounded-xl p-4 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Total Portfolio Value
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono tracking-tight">
              {currencyPrefix}{Math.round(totalPortfolioValue).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`font-mono font-bold ${netReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netReturnPct >= 0 ? '+' : ''}{netReturnPct}%
              </span>
              <span className="text-[11px] text-slate-500">all-time net</span>
            </div>
          </div>

          {/* Unrealized P&L */}
          <div className="glass-card rounded-xl p-4 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Unrealized P&L
            </span>
            <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {unrealizedPnL >= 0 ? '+' : ''}{currencyPrefix}{Math.round(unrealizedPnL).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Realized: <strong className="text-slate-200">{realizedPnL >= 0 ? '+' : ''}{currencyPrefix}{Math.round(realizedPnL).toLocaleString()}</strong>
            </div>
          </div>

          {/* Alpha vs Benchmark */}
          <div className="glass-card rounded-xl p-4 border border-white/5 space-y-1 bg-gradient-to-br from-teal-950/20 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">
                Alpha vs Benchmark
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono tracking-tight">
              {alphaVsBenchmark >= 0 ? '+' : ''}{alphaVsBenchmark}%
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              vs. Index benchmark ({benchmarkReturnPct > 0 ? '+' : ''}{benchmarkReturnPct}%)
            </div>
          </div>

          {/* Available Cash & Win Rate */}
          <div className="glass-card rounded-xl p-4 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Cash Available
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-200 font-mono tracking-tight">
              {currencyPrefix}{Math.round(cash).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Win Rate: <strong className="text-emerald-400 font-bold">{winRatePct}%</strong> ({winningTrades}/{totalClosedTrades || 1} wins)
            </div>
          </div>
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Active Portfolio Holdings
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {holdings.length} POSITIONS
              </span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Real-time mark-to-market valuation
          </span>
        </div>

        {holdings.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No open positions yet</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;New Order&quot; or execute directly from any stock card in the Triage Feed to put your virtual capital to work.
            </p>
            <Button variant="gradient" size="sm" onClick={() => handleOpenNewTrade()}>
              <Plus className="w-3.5 h-3.5" /> Execute First Trade
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Ticker</th>
                  <th className="py-3 px-3 text-right">Shares</th>
                  <th className="py-3 px-3 text-right">Avg Buy</th>
                  <th className="py-3 px-3 text-right">Current Price</th>
                  <th className="py-3 px-3 text-right">Current Value</th>
                  <th className="py-3 px-3 text-right">Unrealized P&L</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {holdings.map((pos) => {
                  const prefix = pos.symbolPrefix || currencyPrefix;
                  const posValue = pos.shares * pos.currentPrice;
                  const cost = pos.shares * pos.avgBuyPrice;
                  const pnl = posValue - cost;
                  const pnlPct = cost > 0 ? parseFloat(((pnl / cost) * 100).toFixed(2)) : 0;
                  const isProfit = pnl >= 0;

                  return (
                    <tr key={pos.ticker} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-100 text-sm">{pos.ticker}</div>
                        <div className="text-[10px] text-slate-400 font-sans truncate max-w-[130px]">{pos.companyName}</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-200">
                        {pos.shares}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-300">
                        {prefix}{pos.avgBuyPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-100">
                        {prefix}{pos.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-100">
                        {prefix}{Math.round(posValue).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}{prefix}{pnl.toFixed(2)}
                        </div>
                        <div className={`text-[10px] ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isProfit ? '+' : ''}{pnlPct}%
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenNewTrade(pos.ticker, 'BUY')}
                            className="px-2 py-1 rounded-lg bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-[11px] font-semibold border border-teal-500/20"
                          >
                            + Buy
                          </button>
                          <button
                            onClick={() => handleOpenNewTrade(pos.ticker, 'SELL')}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-[11px] font-semibold border border-rose-500/20"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Execution Log */}
      {trades.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              Trade Execution Audit Trail
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {trades.length} executed fills
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 font-mono text-xs">
            {trades.map((tr) => {
              const isBuy = tr.type === 'BUY';
              const prefix = tr.symbolPrefix || currencyPrefix;

              return (
                <div
                  key={tr.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {tr.type}
                    </span>
                    <span className="font-bold text-slate-200">{tr.shares}x {tr.ticker}</span>
                    <span className="text-slate-400 text-[11px]">@ {prefix}{tr.price}</span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px] font-sans hidden md:inline">
                      {tr.rationale}
                    </span>
                    <span className="text-slate-200 font-bold">
                      {prefix}{Math.round(tr.total).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">
                      {tr.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trade Execution Order Slip Modal */}
      <Modal
        isOpen={isTradeModalOpen}
        onClose={closeTradeModal}
        title={`Virtual Order Ticket • ${modalTicker}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleExecuteTrade} className="space-y-4 text-xs">
          {/* Buy / Sell Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-white/10 font-bold">
            <button
              type="button"
              onClick={() => setTradeType('BUY')}
              className={`py-2 rounded-lg transition-all ${
                tradeType === 'BUY'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BUY (Go Long)
            </button>
            <button
              type="button"
              onClick={() => setTradeType('SELL')}
              className={`py-2 rounded-lg transition-all ${
                tradeType === 'SELL'
                  ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SELL (Close / Exit)
            </button>
          </div>

          {/* Ticker Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold block">Select Ticker</label>
            <select
              value={modalTicker}
              onChange={(e) => setModalTicker(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-teal-500 focus:outline-none"
            >
              {allTickers.map(t => (
                <option key={t.ticker} value={t.ticker}>
                  {t.ticker} • {t.symbolPrefix || currencyPrefix}{t.price} ({t.changePct > 0 ? '+' : ''}{t.changePct}%)
                </option>
              ))}
            </select>
          </div>

          {/* Shares Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <label className="font-semibold">Number of Shares</label>
              <span className="font-mono text-[11px]">
                Market Price: {currentActiveTickerData.symbolPrefix || currencyPrefix}{currentActiveTickerData.price}
              </span>
            </div>
            <input
              type="number"
              min="1"
              max="10000"
              value={sharesInput}
              onChange={(e) => setSharesInput(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:border-teal-500 focus:outline-none"
            />
            {/* Quick Share Buttons */}
            <div className="flex gap-2 pt-1 font-mono">
              {[5, 20, 50, 100].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setSharesInput(cnt.toString())}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px]"
                >
                  {cnt} shs
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Estimated Capital Required:</span>
              <strong className="text-slate-100">
                {currentActiveTickerData.symbolPrefix || currencyPrefix}
                {Math.round((parseInt(sharesInput, 10) || 0) * currentActiveTickerData.price).toLocaleString()}
              </strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cash Available:</span>
              <span>{currencyPrefix}{Math.round(cash).toLocaleString()}</span>
            </div>
          </div>

          {/* Error / Success Feedback */}
          {tradeError && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{tradeError}</span>
            </div>
          )}
          {tradeSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{tradeSuccess}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            variant={tradeType === 'BUY' ? 'primary' : 'danger'}
            size="md"
            type="submit"
            className="w-full font-bold justify-center"
          >
            <Zap className="w-4 h-4" />
            <span>Confirm {tradeType} Order ({modalTicker})</span>
          </Button>
        </form>
      </Modal>
    </div>
  );
}
