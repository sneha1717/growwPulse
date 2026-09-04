import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, Repeat, PiggyBank, Sparkles } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

export default function InvestmentCalculator({ ticker, price, pctChangeDay, symbolPrefix = '$' }) {
  const isINR = symbolPrefix === '₹';
  const [calcMode, setCalcMode] = useState(isINR ? 'sip' : 'lumpsum'); // 'lumpsum' | 'sip'

  // --- Lumpsum State ---
  const defaultLumpAmount = isINR ? 25000 : 1000;
  const minLumpAmount = isINR ? 1000 : 100;
  const maxLumpAmount = isINR ? 200000 : 10000;
  const stepLumpAmount = isINR ? 1000 : 100;
  const [lumpAmount, setLumpAmount] = useState(defaultLumpAmount);
  const [lumpHorizon, setLumpHorizon] = useState('1m'); // '1m' | '3m' | '1y'

  const lumpMultiplierMap = {
    '1m': (pctChangeDay * 2.2 + 3.5) / 100,
    '3m': (pctChangeDay * 3.8 + 8.2) / 100,
    '1y': (pctChangeDay * 6.5 + 24.5) / 100
  };
  const lumpReturnPct = lumpMultiplierMap[lumpHorizon] || 0.05;
  const lumpProfitLoss = lumpAmount * lumpReturnPct;
  const lumpTotalValue = lumpAmount + lumpProfitLoss;
  const isLumpUp = lumpProfitLoss >= 0;

  // --- SIP (Groww Mode) State ---
  const defaultSipAmount = isINR ? 5000 : 250;
  const minSipAmount = isINR ? 500 : 50;
  const maxSipAmount = isINR ? 50000 : 2500;
  const stepSipAmount = isINR ? 500 : 50;
  const [sipMonthly, setSipMonthly] = useState(defaultSipAmount);
  const [sipYears, setSipYears] = useState(3); // 1 | 3 | 5 years
  const [sipAnnualReturn, setSipAnnualReturn] = useState(15); // 15% p.a. default equity rate

  const sipMonths = sipYears * 12;
  const sipMonthlyRate = (sipAnnualReturn / 100) / 12;
  // SIP Future Value formula: P * [((1 + i)^n - 1) / i] * (1 + i)
  const sipTotalCorpus = sipMonthly * ((Math.pow(1 + sipMonthlyRate, sipMonths) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate);
  const sipTotalInvested = sipMonthly * sipMonths;
  const sipWealthGain = Math.max(0, sipTotalCorpus - sipTotalInvested);
  const sipGainRatio = Math.round((sipWealthGain / sipTotalCorpus) * 100);

  return (
    <div className="space-y-4 pt-2 animate-fadeIn text-xs">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-bold text-slate-100 tracking-wide uppercase font-mono">
            {calcMode === 'sip' ? '🇮🇳 Groww Monthly SIP Planner' : 'Hypothetical ROI Simulator'}
          </h4>
        </div>

        {/* Mode Toggle: Lumpsum vs Monthly SIP */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-white/5">
          <button
            onClick={() => setCalcMode('sip')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
              calcMode === 'sip' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3 h-3" /> Monthly SIP
          </button>
          <button
            onClick={() => setCalcMode('lumpsum')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
              calcMode === 'lumpsum' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PiggyBank className="w-3 h-3" /> Lumpsum
          </button>
        </div>
      </div>

      {/* --- SIP SIMULATOR (GROWW SPECIAL) --- */}
      {calcMode === 'sip' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-[11px] bg-teal-500/10 border border-teal-500/20 rounded-xl px-3 py-1.5 text-teal-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Compounding Wealth Engine for {ticker}
            </span>
            <span className="font-mono font-bold text-[10px] bg-teal-400 text-slate-950 px-1.5 py-0.5 rounded">
              GROWW DNA
            </span>
          </div>

          {/* Monthly SIP Amount Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Monthly SIP Amount:</span>
              <span className="font-mono font-bold text-teal-300 text-sm">
                {symbolPrefix}{sipMonthly.toLocaleString()} / mo
              </span>
            </div>
            <input
              type="range"
              min={minSipAmount}
              max={maxSipAmount}
              step={stepSipAmount}
              value={sipMonthly}
              onChange={(e) => setSipMonthly(Number(e.target.value))}
              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{symbolPrefix}{minSipAmount.toLocaleString()}</span>
              <span>{symbolPrefix}{maxSipAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Duration Tabs & Expected Return */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] block">Investment Tenure:</span>
              <div className="flex gap-1.5">
                {[1, 3, 5].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSipYears(yr)}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono font-semibold transition-colors border ${
                      sipYears === yr
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                        : 'bg-slate-900 text-slate-400 border-white/5 hover:text-slate-200'
                    }`}
                  >
                    {yr} Year{yr > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Expected Annual Return (CAGR):</span>
                <span className="font-mono font-bold text-slate-200">{sipAnnualReturn}%</span>
              </div>
              <input
                type="range"
                min={8}
                max={28}
                step={1}
                value={sipAnnualReturn}
                onChange={(e) => setSipAnnualReturn(Number(e.target.value))}
                className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Compounding Visual Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Invested: {symbolPrefix}{sipTotalInvested.toLocaleString()}</span>
              <span className="text-emerald-400 font-bold">Gain: +{symbolPrefix}{Math.round(sipWealthGain).toLocaleString()} ({sipGainRatio}% of total)</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-slate-600 transition-all duration-500"
                style={{ width: `${100 - sipGainRatio}%` }}
                title="Principal Invested"
              />
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${sipGainRatio}%` }}
                title="Compounded Wealth Gain"
              />
            </div>
          </div>

          {/* SIP Results Card */}
          <div className="p-3.5 rounded-xl glass-panel border border-white/10 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Total Invested</span>
              <div className="text-xs sm:text-sm font-bold font-mono text-slate-300">
                <AnimatedNumber value={sipTotalInvested} prefix={symbolPrefix} />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Wealth Gain</span>
              <div className="text-xs sm:text-sm font-bold font-mono text-emerald-400">
                +<AnimatedNumber value={sipWealthGain} prefix={symbolPrefix} />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-teal-400 uppercase block font-bold">Total Corpus</span>
              <div className="text-xs sm:text-sm font-bold font-mono text-slate-100">
                <AnimatedNumber value={sipTotalCorpus} prefix={symbolPrefix} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LUMPSUM MODE --- */}
      {calcMode === 'lumpsum' && (
        <div className="space-y-3.5">
          {/* Lumpsum Amount Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Hypothetical Investment Capital:</span>
              <span className="font-mono font-bold text-slate-100">
                {symbolPrefix}{lumpAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={minLumpAmount}
              max={maxLumpAmount}
              step={stepLumpAmount}
              value={lumpAmount}
              onChange={(e) => setLumpAmount(Number(e.target.value))}
              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{symbolPrefix}{minLumpAmount.toLocaleString()}</span>
              <span>{symbolPrefix}{maxLumpAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Horizon Selection */}
          <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <span className="text-slate-400 text-[11px]">Simulated Horizon:</span>
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-900 border border-white/5">
              {['1m', '3m', '1y'].map((h) => (
                <button
                  key={h}
                  onClick={() => setLumpHorizon(h)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold transition-colors ${
                    lumpHorizon === h ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h === '1m' ? '1 Month' : h === '3m' ? '3 Months' : '1 Year'}
                </button>
              ))}
            </div>
          </div>

          {/* Results Overview Box */}
          <div className="p-3.5 rounded-xl glass-panel border border-white/10 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Portfolio Value</span>
              <div className="text-sm font-bold font-mono text-slate-100">
                <AnimatedNumber value={lumpTotalValue} prefix={symbolPrefix} />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Total P&L</span>
              <div className={`text-sm font-bold font-mono flex items-center justify-center gap-0.5 ${isLumpUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isLumpUp ? '+' : ''}
                <AnimatedNumber value={lumpProfitLoss} prefix={symbolPrefix} />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Return ROI</span>
              <div className={`text-sm font-bold font-mono ${isLumpUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isLumpUp ? '+' : ''}{(lumpReturnPct * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
