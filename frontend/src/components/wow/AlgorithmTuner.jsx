import React, { useState } from 'react';
import { Sliders, RotateCcw, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';

export const DEFAULT_ALGO_WEIGHTS = {
  w1: 2.5, // Volatility Z-Score
  w2: 1.8, // Volume Anomaly
  w3: 2.2, // Level Crossing
  w4: 0.8  // Time Decay
};

export default function AlgorithmTuner({ weights, onWeightsChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { name: 'Balanced Default', weights: { w1: 2.5, w2: 1.8, w3: 2.2, w4: 0.8 } },
    { name: 'Breakout Hunter', weights: { w1: 4.0, w2: 1.2, w3: 3.8, w4: 0.2 } },
    { name: 'Volume Flow Purist', weights: { w1: 1.2, w2: 4.5, w3: 1.5, w4: 0.5 } },
    { name: 'Catch-Up Bias', weights: { w1: 2.0, w2: 1.5, w3: 1.5, w4: 2.5 } }
  ];

  const handleSliderChange = (key, val) => {
    onWeightsChange({
      ...weights,
      [key]: parseFloat(val)
    });
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                Interactive Attention Score Engine Tuner
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                FORMULA SIMULATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Customize algorithmic weights (w₁, w₂, w₃, w₄) to observe real-time triage feed re-ranking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isOpen ? 'Close Tuner' : 'Adjust Weights'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-white/5 space-y-5 bg-slate-950/40 animate-fadeIn">
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Quick Calibration Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.name}
                  onClick={() => onWeightsChange(p.weights)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium glass-panel hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-teal-500/40 transition-colors"
                >
                  {p.name}
                </button>
              ))}
              <button
                onClick={onReset}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/5 flex items-center gap-1.5 ml-auto"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Slider 1: Relative Move Z-score (w1) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  w₁ Volatility Z-Score Weight
                </span>
                <span className="font-mono text-teal-400 font-bold">{weights.w1.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={weights.w1}
                onChange={(e) => handleSliderChange('w1', e.target.value)}
                className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Measures today's move divided by 30-day volatility (σ).
              </p>
            </div>

            {/* Slider 2: Volume Anomaly (w2) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  w₂ Volume Anomaly Surge Weight
                </span>
                <span className="font-mono text-violet-400 font-bold">{weights.w2.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={weights.w2}
                onChange={(e) => handleSliderChange('w2', e.target.value)}
                className="w-full accent-violet-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Multiplier for volume relative to 30-day moving average volume.
              </p>
            </div>

            {/* Slider 3: Level Crossing Flag (w3) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  w₃ Level Crossing Flag Weight
                </span>
                <span className="font-mono text-cyan-400 font-bold">{weights.w3.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={weights.w3}
                onChange={(e) => handleSliderChange('w3', e.target.value)}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Triggered on 52-week highs/lows or 50-day MA breakthroughs.
              </p>
            </div>

            {/* Slider 4: Time Decay (w4) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  w₄ Session Time-Decay Boost
                </span>
                <span className="font-mono text-amber-400 font-bold">{weights.w4.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.1"
                value={weights.w4}
                onChange={(e) => handleSliderChange('w4', e.target.value)}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Progressively increases attention boost the longer user was away.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
