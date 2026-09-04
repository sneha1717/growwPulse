import React, { useState } from 'react';
import { Moon, Sun, Terminal, ChevronDown } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const themeConfig = {
    midnight: {
      label: 'Midnight Cyber',
      icon: Moon,
      color: 'text-teal-400',
      tag: 'DARK'
    },
    groww: {
      label: 'Groww Emerald',
      icon: Sun,
      color: 'text-emerald-500',
      tag: 'LIGHT'
    },
    bloomberg: {
      label: 'Bloomberg Amber',
      icon: Terminal,
      color: 'text-amber-400',
      tag: 'CRT'
    }
  };

  const current = themeConfig[theme] || themeConfig.midnight;
  const Icon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-panel hover:bg-white/10 text-xs transition-all border border-white/10 shadow-sm"
        title="Toggle Theme: Midnight Cyber, Groww Emerald Light, or Bloomberg Amber Terminal"
      >
        <Icon className={`w-3.5 h-3.5 ${current.color}`} />
        <span className="hidden sm:inline font-mono text-[11px] font-semibold">
          {current.label.split(' ')[0]}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1.5 right-0 w-44 glass-panel rounded-2xl border border-white/10 p-1.5 shadow-2xl z-50 space-y-1">
          <div className="text-[9px] font-mono uppercase text-slate-400 px-2.5 py-1 tracking-wider">
            Display Theme
          </div>

          {Object.entries(themeConfig).map(([key, cfg]) => {
            const ItemIcon = cfg.icon;
            const isSelected = theme === key;

            return (
              <button
                key={key}
                onClick={() => {
                  setTheme(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors text-left ${
                  isSelected ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ItemIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  <span>{cfg.label}</span>
                </div>
                <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-slate-400">
                  {cfg.tag}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
