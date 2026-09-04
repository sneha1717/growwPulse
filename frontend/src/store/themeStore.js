import { create } from 'zustand';

const THEMES = ['midnight', 'groww', 'bloomberg'];

export const useThemeStore = create((set, get) => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('pulse_theme') || 'midnight' : 'midnight';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', saved);
  }

  return {
    theme: saved,
    setTheme: (newTheme) => {
      if (!THEMES.includes(newTheme)) return;
      localStorage.setItem('pulse_theme', newTheme);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newTheme);
      }
      set({ theme: newTheme });
    },
    toggleTheme: () => {
      const current = get().theme;
      const nextIndex = (THEMES.indexOf(current) + 1) % THEMES.length;
      const next = THEMES[nextIndex];
      get().setTheme(next);
    }
  };
});
