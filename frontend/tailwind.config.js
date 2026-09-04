/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0A0E17',
        surface: {
          50: '#151C2C',
          100: '#111726',
          200: '#0E1320',
          card: 'rgba(17, 24, 39, 0.7)',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        brand: {
          teal: '#14b8a6',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          indigo: '#6366f1'
        },
        market: {
          up: '#10b981',
          down: '#f43f5e',
          neutral: '#94a3b8'
        }
      },
      animation: {
        'ticker-slow': 'tickerScroll 35s linear infinite',
        'ticker-reverse': 'tickerScrollReverse 40s linear infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-green': 'flashGreen 1.2s ease-out',
        'flash-red': 'flashRed 1.2s ease-out',
        'shimmer': 'shimmer 2s infinite linear'
      },
      keyframes: {
        tickerScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        tickerScrollReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)', boxShadow: '0 0 8px #14b8a6' },
          '50%': { opacity: 0.4, transform: 'scale(0.85)', boxShadow: '0 0 2px #14b8a6' }
        },
        flashGreen: {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0.35)', color: '#34d399' },
          '100%': { backgroundColor: 'transparent' }
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(244, 63, 94, 0.35)', color: '#fb7185' },
          '100%': { backgroundColor: 'transparent' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}
