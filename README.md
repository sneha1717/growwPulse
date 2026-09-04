# Pulse — The Intelligent Market Watchlist Triage Suite

[![Live Production](https://img.shields.io/badge/Production-groww--pulse--beta.vercel.app-14b8a6?style=for-the-badge&logo=vercel&logoColor=white)](https://groww-pulse-beta.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-sneha1717%2FgrowwPulse-10b981?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sneha1717/growwPulse.git)
[![Live Finnhub API](https://img.shields.io/badge/Finnhub-Live_Quote_Engine-06b6d4?style=for-the-badge&logo=financialtimes&logoColor=white)](https://finnhub.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet?style=for-the-badge)](LICENSE)

> **Submission for CODE 2026 — u/earth by grow**  
> **Core Pitch:** Most watchlists are spreadsheets with tickers. Pulse is an institutional **triage feed** — it isolates the 2-3 things that actually deserve your attention today, explains *why* in plain English, and keeps everything else quiet on purpose.

---

## 🌐 Live Web App & Deployment

* 🚀 **Production URL**: **[https://groww-pulse-beta.vercel.app](https://groww-pulse-beta.vercel.app)**
* 💻 **GitHub Repo**: **[https://github.com/sneha1717/growwPulse.git](https://github.com/sneha1717/growwPulse.git)**
* 🟢 **Live Market Execution**: Powered by direct client-to-Finnhub REST API integration with real-time quotes, symbol lookup, and financial wire news.

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

## 🚀 The 4 Institutional Workspaces & Key Features

### 🏢 Workspace Modes
1. **⚡ Triage Feed**: Intelligent anomaly triage, plain-English diff narratives, Attention Score formula tuner, Health Score radial gauge, and Black Swan Stress Tester.
2. **🐋 Whale Radar & Dark Pool Terminal**: Institutional off-exchange block orders (>$5M), Gamma Exposure (GEX), Put/Call sentiment, Congressional STOCK Act disclosures (Pelosi, Jensen Huang), Wall Street Bulge Bracket consensus targets, and 1,000-path Monte Carlo VaR simulation.
3. **⚔️ Stock Duel Studio**: Head-to-head factor comparison studio. Select any two stocks to contrast relative returns, volatility $\sigma$, institutional inflows, and automated quant triage verdicts.
4. **💼 Paper Trader Desk**: ₹10,00,000 / $100,000 virtual trading simulator. Execute 1-click trades directly from triage cards, track unrealized/realized P&L, win rate %, and **Alpha vs. Benchmark index**.
5. **🤖 AI Desk Co-Pilot**: Slide-over terminal analyst answering macro risk questions, FII/DII flow breakdowns, and trade ideas with real-time streaming reasoning.

---

## 🌟 Feature Showcases

| Feature | Description |
|---|---|
| **🐋 Institutional Whale Radar & Dark Pool Desk** | **Brand New Institutional Workspace**: Real-time tracker for off-exchange blocks (>$5M), Market Gamma Exposure (+$2.84B GEX), Put/Call ratio gauges, Congressional trades (Form 4 & STOCK Act), Bulge Bracket price target consensus, and a 1,000-path Monte Carlo Value-at-Risk (VaR) path projection engine. |
| **📈 Quant Indicators (RSI & MACD)** | **Technical Analysis Overlays**: Live 14-period Wilder Relative Strength Index (RSI) with 70/30 overbought/oversold bands, and Moving Average Convergence Divergence (MACD 12, 26, 9) signal line + dynamic color histogram bars. |
| **🔊 Native Web Audio FX & Haptics Engine** | **Zero-Dependency Sound Synthesizer**: Tactile audio cues synthesized natively via Web Audio API oscillators (cyber clicks on navigation, trade fill chimes on paper execution, and klaxon alarms on Black Swan shocks) with a global mute toggle. |
| **🔍 Live Ticker Search & Filter Bar** | **Interface Enhancement**: Real-time ticker, company name, and sector search with hotkey `/`, Finnhub auto-suggest dropdown, and 1-click filter chips (`All`, `Needs Attention`, `Quiet`, `Gainers`, `Losers`). |
| **⚡ Dashboard Quick Action Dock** | **Navigation Dock**: Collapsible side option bar with 1-click workspace switching, live Market Breadth ratio bar, Finnhub latency ping, and breaking market wire headlines. |
| **📊 Pearson Correlation Heatmap** | **Quantitative Matrix**: Pairwise co-movement grid across all watchlist assets with hover inspector, Strongest Co-Movement pair, Top Diversifier / Hedge, and mean portfolio correlation. |
| **⚔️ Stock Duel Studio** | **Comparison Arena**: Interactive head-to-head factor battle (returns, z-score, volume anomaly, FII flow, correlation spread, and automated triage verdict). |
| **💼 ₹10L Paper Trading Desk** | **Virtual Trading**: Portfolio simulator with real-time mark-to-market P&L, 1-click order tickets, and live Alpha vs Benchmark tracker. |
| **🤖 AI Trade Desk Co-Pilot** | **Terminal Assistant**: Slide-over analyst with quick chips (*"Why is TSLA flagged?"*, *"Suggest best hedge against rate hike"*). |
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

## 📋 Instructions to Run for Reviewers & Judges

Reviewers can test Pulse using either the **Instant Cloud Deployment** (recommended, zero-install) or by **Running Locally via Git Clone**.

---

### Option A: Instant Cloud Review (Zero Setup — Recommended)
Reviewers can test the entire full-stack experience immediately in the browser:
1. Open the production URL: **[https://groww-pulse-beta.vercel.app](https://groww-pulse-beta.vercel.app)**
2. Click **"Launch Pulse Terminal (Live API)"** or **"1-Click Instant Trader Access"** on the landing page.
3. You will immediately be authenticated into the live dashboard with pre-loaded watchlists, 30-day historical data, and live Finnhub quotes.

---

### Option B: Running Locally via Git Clone

#### 1. Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Git**

#### 2. Clone the Repository
```bash
git clone https://github.com/sneha1717/growwPulse.git
cd growwPulse
```

#### 3. Install All Dependencies (Frontend & Backend)
Run the root package installer, which installs both backend and frontend dependencies in one command:
```bash
npm run install:all
```
*(Alternatively: `cd backend && npm install && cd ../frontend && npm install`)*

#### 4. Environment Configuration (Optional)
The project comes with built-in zero-config embedded SQLite and automated Finnhub fallback.
If you would like to supply your own free Finnhub API key:
- Create `backend/.env`:
  ```env
  PORT=5001
  JWT_SECRET=pulse_dev_jwt_secret_key_2026
  FINNHUB_API_KEY=your_api_key_here
  ```
- Create `frontend/.env`:
  ```env
  VITE_API_URL=http://localhost:5001/api
  VITE_FINNHUB_API_KEY=your_api_key_here
  ```
*(Note: If no API key is provided, Pulse's realistic market simulator and client cache will seamlessly serve real quotes with zero setup!)*

#### 5. Launch Development Servers
Run both the Express backend API and the Vite frontend client simultaneously:
```bash
npm run dev
```
- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`

Open **`http://localhost:5173`** in your browser to begin testing.

---

### Option C: Running the Automated Test Suite

Reviewers can verify the mathematical models, correlation algorithms, and database integrity:
```bash
# 1. Run unit & algorithmic tests (verifies Attention Scores, Z-score math, correlation matrices):
npm test

# 2. Run end-to-end integration tests (verifies REST API routes, auth tokens, feed generation):
npm run test:e2e
```

---

## 🎯 Reviewer & Judge Test Checklist

Here is a quick sequence to thoroughly test all features during evaluation:

| Test Step | Action to Take | Expected Outcome |
|---|---|---|
| **1. Attention Triage Feed** | Inspect the main triage view on `US Tech Titans` or `Nifty 50 Titans`. | Watchlist is split into **"Needs Your Attention"** (anomalies with plain-English diffs) and collapsed **"Quiet & Expected"**. |
| **2. Formula Algorithm Tuner** | Click **"Tuner"** on the Quick Action Dock and drag the Volume or Z-Score sliders. | Feed cards instantly re-rank their attention priorities in real-time based on new mathematical weights. |
| **3. Whale Radar & Dark Pool Desk** | Click the **"Whale Radar"** tab in the top navbar. | Real-time stream of $5M+ off-exchange blocks, GEX exposure (+$2.84B), Congressional STOCK Act trades (Pelosi, Jensen Huang), and a 1,000-path Monte Carlo VaR simulator. |
| **4. Technical Indicators (RSI & MACD)** | Click **"Chart"** on any stock card, then toggle between `Area`, `OHLC`, `RSI (14)`, and `MACD`. | RSI renders 70/30 overbought/oversold bands; MACD renders fast/slow EMA signals with dynamic color histograms. |
| **5. Stock Duel Studio** | Click **"Stock Duel"** in the top navbar, choose two assets or click presets (`NVDA vs TSLA`). | Direct factor comparison showdown bars with momentum, volatility $\sigma$, and automated quant triage verdict. |
| **6. ₹10L Paper Trading Desk** | Click **"Paper Trader"** tab, click **"Buy Stock"**, enter 10 shares, and click Execute. | Synthesized Web Audio trade fill chime plays, mark-to-market P&L updates, and Alpha vs. Benchmark is tracked live. |
| **7. Black Swan Macro Shock** | Click **"Simulate Shock"** on the side dock or press keyboard shortcut `S`. | Emergency dual-sawtooth klaxon alarm plays; portfolio drawdown and hedge metrics are stress-tested instantly. |
| **8. Tri-Theme Switcher** | Click the Sun/Moon/Terminal icon in the top right navbar. | Seamless toggle between **🌙 Midnight Cyber**, **☀️ Groww Emerald**, and **📟 Bloomberg Amber**. |
| **9. Morning Memo Export** | Click **"Memo"** on the side dock. | Opens a print-ready 1-page executive market brief with 1-click Slack/WhatsApp markdown copy. |

---

---

## 🛡️ Edge Cases & Resilience
- **Zero-Setup Database**: Uses fast, embedded SQLite by default with pre-seeded data so judges never face database configuration barriers. Full PostgreSQL migration (`backend/migrations/schema.sql`) and `docker-compose.yml` are also provided.
- **Finnhub Rate Limits**: Free-tier rate limits (60 req/min) are managed via an in-memory cache and automatic fallback to our realistic market data simulator so that UI never fails or blanks out.
- **Stale Data Fallback**: Snapshots carry precise timestamps with "As of HH:MM" and an explicit STALE badge if a polling cycle is delayed.
