import React from 'react';
import { Command, Terminal, Sparkles, X } from 'lucide-react';
import Modal from '../ui/Modal';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  const shortcuts = [
    { key: 'W', desc: 'Cycle Workspace (Triage Feed ↔ Stock Duel ↔ Paper Trader)' },
    { key: 'I', desc: 'Toggle Pulse AI Trade Desk Co-Pilot drawer' },
    { key: 'J / ↓', desc: 'Focus next stock card in triage feed' },
    { key: 'K / ↑', desc: 'Focus previous stock card' },
    { key: 'C', desc: 'Toggle Candlestick / Technical Area chart' },
    { key: 'D', desc: 'Toggle Institutional Bull vs. Bear debate' },
    { key: 'R', desc: 'Toggle Groww SIP & ROI return calculator' },
    { key: 'A', desc: 'Toggle Smart Price & Attention alerts' },
    { key: 'T', desc: 'Open Black Swan Macro Scenario Stress Tester' },
    { key: 'M', desc: 'Open Executive Morning Memo (PDF report)' },
    { key: 'B', desc: 'Play / Pause 30s synthesized audio podcast' },
    { key: 'S', desc: 'Simulate sudden market breakout shock' },
    { key: '⌘ K', desc: 'Open command palette (search & actions)' },
    { key: '?', desc: 'Toggle this keyboard shortcut overlay' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bloomberg Terminal Power Shortcuts" maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span className="font-mono font-bold">Vim-Style Navigation Active</span>
          </div>
          <span className="text-[10px] font-mono bg-teal-400 text-slate-950 font-bold px-2 py-0.5 rounded">
            PRO TRADER
          </span>
        </div>

        <div className="space-y-2 font-mono">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-teal-500/30 transition-colors"
            >
              <span className="text-slate-300 text-xs font-sans">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-white/10 text-teal-300 font-bold text-[11px] shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 text-center pt-2">
          Navigate your entire market watchlist without touching the mouse.
        </p>
      </div>
    </Modal>
  );
}
