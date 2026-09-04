import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, ShieldCheck, Zap, Sparkles, BarChart2, Layers } from 'lucide-react';
import Button from '../components/ui/Button';
import AmbientBackground from '../components/layout/AmbientBackground';
import { useAuthStore } from '../store/authStore';

export default function Landing({ onNavigateLogin, onNavigateSignup }) {
  const { guestLogin } = useAuthStore();

  const handleDemoClick = async () => {
    await guestLogin();
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#0A0E17]">
      <AmbientBackground />

      {/* Top Simple Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-violet-600 flex items-center justify-center shadow-[0_0_25px_rgba(20,184,166,0.4)]">
            <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-black tracking-tight text-white font-mono">
            PULSE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateLogin}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-colors"
          >
            Sign In
          </button>
          <Button variant="primary" size="sm" onClick={handleDemoClick}>
            <Zap className="w-3.5 h-3.5" /> Launch Terminal
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center space-y-8 my-auto">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-teal-500/30 text-teal-300 text-xs font-mono font-medium shadow-[0_0_20px_rgba(20,184,166,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>CODE 2026 HACKATHON // U/EARTH BY GROW</span>
        </motion.div>

        {/* Staggered Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
        >
          The heartbeat of your{' '}
          <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
            watchlist.
          </span>
        </motion.h1>

        {/* Subtitle / Pitch */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Most watchlists are noisy spreadsheets with tickers. <strong className="text-teal-300 font-semibold">Pulse</strong> is a <span className="underline decoration-teal-400 decoration-2">triage feed</span> — it surfaces the 2-3 things that actually deserve your attention today, explains <span className="italic">why</span> in plain English, and animates what changed since you last checked. Everything else stays quiet on purpose.
        </motion.p>

        {/* Primary Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Button variant="primary" size="lg" onClick={handleDemoClick} className="w-full sm:w-auto text-sm px-8 py-3.5">
            <Zap className="w-4 h-4 text-slate-950" />
            Launch Pulse Terminal (Live API)
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <Button variant="secondary" size="lg" onClick={onNavigateSignup} className="w-full sm:w-auto text-sm">
            Create Custom Account
          </Button>
        </motion.div>

        {/* 3 Core Value Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-12"
        >
          <div className="glass-card rounded-2xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-100">Attention Score Algorithm</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Normalizes moves against 30-day volatility z-scores, volume surges, and 52w/MA level crossings.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-100">Plain-English Diff Stories</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly compares your previous session snapshot against current quotes with human narratives.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-100">Correlation & Health Matrix</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive cross-asset Pearson correlation matrix and animated portfolio risk health gauge.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/5 text-center text-xs text-slate-500 font-mono">
        Pulse • Built for CODE 2026 Hackathon • Powered by React, Recharts & Node
      </footer>
    </div>
  );
}
