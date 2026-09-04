# Pulse — A Smart Market Watchlist Triage Feed
> **Hackathon Submission:** CODE 2026 — u/earth by grow  
> **Pitch:** Most watchlists are spreadsheets with tickers. Pulse is a **triage feed** — it tells you the 2-3 things that actually deserve your attention today, explains *why* in plain English, and animates the story of what happened since you left. Everything else stays quiet on purpose.

---

## 🌟 Executive Summary & The Core Design Decision

Traditional stock watchlists treat every ticker equally: a +2% move in a sleepy utility stock is visually presented identically to a +2% move in a volatile high-beta stock. This creates **information fatigue** and forces users to manually parse dozens of numbers to discern what actually matters.

**Pulse reimagines the watchlist as an intelligent triage engine.**

At the center of Pulse is the **Attention Score Algorithm**. Every time market data updates, Pulse scores each stock using 4 dimensional factors:
1. **Relative Move Z-Score ($\sigma$-normalized)**: A +5% move on Tesla (which swings ±4% routinely) is less surprising than a +3% move on Apple. Pulse normalizes every move against the asset's trailing 30-day volatility.
2. **Volume Anomaly Ratio**: High volume confirms that institutional conviction is driving the move rather than illiquid noise.
3. **Level-Crossing Detection**: Breakthroughs above 52-week highs, breakdowns below 52-week lows, or crossing the 50-day moving average represent structural regime shifts.
4. **Session Time-Decay Boost**: The longer a user has been away, the more weight is given to accumulated moves, ensuring returning users immediately catch up on what built up while they were away.

Stocks with elevated Attention Scores are elevated to **"Needs Your Attention"** with generated plain-English narrative summaries and diff comparisons against the user's prior visit. Expected, normal-range stocks are gracefully deprioritized into **"Quiet & Expected"**.

---

## 📐 Attention Score Mathematical Formulation

$$\text{attention\_score} = w_1 \cdot \text{relative\_move\_zscore} + w_2 \cdot \text{volume\_anomaly\_ratio} + w_3 \cdot \text{level\_crossing\_flag} + w_4 \cdot \text{time\_decay\_since\_last\_seen}$$

Where:
- $\text{relative\_move\_zscore} = \frac{|\text{today's \% move}|}{\sigma_{30\text{d}}}$
- $\sigma_{30\text{d}} = \sqrt{\frac{1}{N-1}\sum_{i=1}^N (R_i - \bar{R})^2}$ (trailing 30-day daily return volatility)
- $\text{volume\_anomaly\_ratio} = \frac{\text{volume}_{\text{today}}}{\overline{\text{volume}}_{30\text{d}}}$
- $\text{level\_crossing\_flag} \in \{0, 1\}$ (1 if price broke 52w high, 52w low, or crossed 50-day moving average)
- $\text{time\_decay\_since\_last\_seen} = f(\Delta t_{\text{hours}})$, an S-curve weighting elapsed time since the user's last recorded session.

---

## 🚀 The 3 Workspaces & Key Features

### 🏢 Workspace Modes
1. **⚡ Triage Feed**: Intelligent anomaly triage, plain-English diff narratives, Attention Score formula tuner, Health Score radial gauge, and Black Swan Stress Tester.
2. **⚔️ Stock Duel Studio**: Head-to-head factor comparison studio. Select any two stocks to contrast relative returns, volatility $\sigma$, institutional inflows, and automated quant triage verdicts.
3. **💼 Paper Trader Desk**: ₹10,00,000 / $100,000 virtual trading simulator. Execute 1-click trades directly from triage cards, track unrealized/realized P&L, win rate %, and **Alpha vs. Benchmark index**.
4. **🤖 AI Desk Co-Pilot**: Slide-over terminal analyst answering macro risk questions, FII/DII flow breakdowns, and trade ideas with real-time streaming reasoning.

---

## 🌟 Feature Showcases

| Feature | Description |
|---|---|
| **⚔️ Stock Duel Studio** | **New Workspace**: Interactive head-to-head factor battle (returns, z-score, volume anomaly, FII flow, correlation spread, and automated triage verdict). |
| **💼 ₹10L Paper Trading Desk** | **New Workspace**: Virtual portfolio simulator with real-time mark-to-market P&L, 1-click order tickets, and live Alpha vs Benchmark tracker. |
| **🤖 AI Trade Desk Co-Pilot** | **New Assistant**: Slide-over terminal analyst with quick chips (*"Why is TSLA flagged?"*, *"Suggest best hedge against rate hike"*). |
| **🌪️ Black Swan Macro Stress Tester** | **1-Click Crisis Simulator**: Emergency RBI/Fed +75bps Rate Spike, Strait of Hormuz Crude $120/bbl, AI CapEx Bust -25%, Budget Super-Cycle +15%. Auto-calculates portfolio drawdown, isolates top safe-haven hedges vs vulnerabilities, and applies the shock to re-triage the dashboard feed in real-time. |
| **🎨 Tri-Theme Switcher** | Switch instantly between **🌙 Midnight Cyber** (neon glassmorphic dark mode), **☀️ Groww Emerald Light** (official Groww emerald daylight UI), and **📟 Bloomberg Amber Terminal** (retro CRT amber terminal mode) with persistent localStorage state. |
| **🏛️ FII / DII Smart Money Strip** | Institutional intelligence displaying real-time Foreign (FII) and Domestic Mutual Fund (DII) net inflows/outflows with net accumulation tags on stock cards. |
| **🇮🇳 Groww Monthly SIP Planner** | Compound wealth journey simulator (₹500–₹50,000/mo, 1/3/5 years, CAGR rate slider, and invested vs wealth gain progress bar). |
| **🧠 Retail FOMO vs Panic Meter** | Cross-asset psychological barometer (0–100) scoring fear, complacency, momentum, and extreme euphoria. |
| **🎯 Triage Prescriptions** | Executive 3-bullet daily action plan: overextension warning, institutional liquidity accumulation, and portfolio anchor. |
| **⌨️ Bloomberg Terminal Vim Hotkeys** | Complete keyboard navigation (`J`/`K` cards, `C` chart, `R` SIP calculator, `D` debate, `A` alerts, `T` stress tester, `M` memo, `S` shock, `B` briefing, `?` shortcuts). |
| **📄 1-Click Morning Memo Export** | Print-perfect 1-page PDF export (`window.print()` with `@media print` CSS) + 1-click Slack/WhatsApp markdown copy. |
| **🇮🇳 Nifty 50 vs US Dual Market** | Native support for Indian bluechips (`₹` pricing, NSE sectors, Reliance, TCS, HDFC, Zomato) alongside Wall Street tech titans. |
| **🕯️ Candlestick (OHLC) & Area Chart** | Interactive toggle between smooth Area gradient chart and SVG Candlestick (OHLC) wicks/bodies with volume bars. |
| **⚖️ Bull vs Bear Institutional Debate** | Direct side-by-side consensus ratio (e.g. 68% Bull / 32% Bear) detailing key growth drivers vs fundamental risks. |
| **🧮 "What If I Invested" ROI Calculator** | Interactive capital slider (₹1,000–₹2,00,000 or $100–$10,000) with 1m, 3m, and 1y return projections and animated P&L. |
| **🔔 Smart Alert Engine with Audio Chimes** | Zero-dependency high-tech chime synthesized via browser Web Audio API + visual toast notifications with 1-click test firing. |
| **🎙️ 30s Voice Briefing Podcast** | Dynamic spoken market digest via Web Speech API with dancing audio visualizer equalizer bars. |
| **🎛️ Formula Algorithm Tuner** | Interactive sliders for $w_1$ (z-score), $w_2$ (volume), $w_3$ (levels), $w_4$ (time decay) with instant real-time re-ranking. |
| **Triage Feed Split** | Partitions assets into high-priority **"Needs your attention"** vs collapsed **"Quiet"** cards. |
| **Plain-English Diff Narratives** | Template-driven human explanations (e.g., *"TSLA moved +5.4% on 3.2x average volume — broke above 50-day MA in the last 4 hours"*). |
| **Interactive Attention Timeline Scrubber** | Drag or jump across intervals (*Live Now*, *1h ago*, *4h ago*, *Yesterday*, *3d ago*, *1w ago*) to replay market attention dynamics over time. |
| **Cross-Asset Correlation Matrix** | Computes the complete Pearson correlation matrix ($r \in [-1.0, 1.0]$) across 30-day return series with interactive cell hover insights. |
| **Watchlist Health Index Gauge** | Animated circular radial gauge (0-100) quantifying portfolio risk across Volatility Stability, Diversification, and Momentum. |
| **Live Pulse Indicators & Ticker Tape** | Glowing CSS keyframe pulse dots showing data freshness within the last 90 seconds + infinite marquee ticker tape. |
| **Command Palette (`Cmd+K` / `Ctrl+K`)** | Instant keyboard navigation to add tickers, switch watchlists, or simulate market shocks. |
| **Shareable Snapshot Card** | Generates an exportable, copyable summary card of the watchlist status for demo and social sharing. |
| **Simulate Market Shock Button** | 1-click trigger to simulate an abnormal breakout on TSLA or NVDA to observe the Attention Score engine live. |

---

## 🛠️ Architecture & Tech Stack

```
growhack2/
├── backend/
│   ├── config/database.js       # Dual-mode SQLite (default) + PostgreSQL adapter
│   ├── services/attention.js    # Core Attention Score algorithm & diff engine
│   ├── services/marketData.js   # 30-day snapshots, volatility, and realistic simulator
│   ├── services/polling.js      # Background scheduled polling worker (30s interval)
│   ├── services/finnhub.js      # Finnhub live API integration with caching & fallback
│   ├── routes/auth.js           # JWT auth + 1-Click Guest Demo login for judges
│   ├── routes/feed.js           # Ranked triage feed endpoint
│   ├── routes/analytics.js      # Correlation matrix, health gauge, and timeline scrubber
│   ├── routes/watchlists.js     # Multiple named watchlists CRUD
│   └── server.js                # Express API entrypoint
└── frontend/
    ├── src/components/layout/   # Navbar, Ambient ticker tape background
    ├── src/components/feed/     # StockCard, AnimatedNumber, PulseIndicator, StockChart
    ├── src/components/wow/      # CorrelationHeatmap, TimelineScrubber, HealthScoreGauge, CommandPalette
    ├── src/pages/               # Landing, Dashboard, Login, Signup
    └── src/store/               # Zustand state management
```

---

## ⚡ Quick Start & Running Locally

### 1. Prerequisites
- Node.js 18+ and npm installed.

### 2. Install Dependencies
```bash
# Install backend and frontend dependencies
npm run install:all
```

### 3. Run Development Servers
```bash
# Runs backend (port 5001) and frontend (port 5173) concurrently
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

> 💡 **Judge Fast-Track Tip**: Click **"Launch Live Demo as Guest Trader"** on the landing page for immediate 1-click access with pre-seeded watchlists, 30-day price histories, and attention scores.

---

## ⚡ 1-Click Vercel Deployment

Pulse is pre-configured for seamless 1-click deployment to **Vercel**:
1. Push this repository to your GitHub account.
2. In your Vercel Dashboard, click **"Add New Project"** and import the repo.
3. Keep default build settings (`vercel.json` handles routing automatically):
   - **Framework Preset**: Vite
   - **Build Command**: `cd frontend && npm run build` (or `npm run build` if Root is `frontend`)
   - **Output Directory**: `frontend/dist` (or `dist` if Root is `frontend`)
4. Click **Deploy**!

> 🛡️ **Bulletproof Demo Guarantee**: When deployed on Vercel as a static app, Pulse's client-side fallback engine (`frontend/src/api/mockFallback.js`) transparently handles all data feeds, attention scoring, stock duels, and paper trading with zero external dependency barriers. The live Vercel demo link **never fails or crashes**!

---

## 🧪 Testing & Verification

Run the automated backend test suite:
```bash
# Unit & algorithmic test (verifies attention scores, correlation math, and database)
npm test

# Full-stack end-to-end verification (verifies HTTP endpoints, JWT, feed diffs)
node backend/e2e_test.js
```

---

## 🛡️ Edge Cases & Resilience
- **Zero-Setup Database**: Uses fast, embedded SQLite by default with pre-seeded data so judges never face database configuration barriers. Full PostgreSQL migration (`backend/migrations/schema.sql`) and `docker-compose.yml` are also provided.
- **Finnhub Rate Limits**: Free-tier rate limits (60 req/min) are managed via an in-memory cache and automatic fallback to our realistic market data simulator so that UI never fails or blanks out.
- **Stale Data Fallback**: Snapshots carry precise timestamps with "As of HH:MM" and an explicit STALE badge if a polling cycle is delayed.
