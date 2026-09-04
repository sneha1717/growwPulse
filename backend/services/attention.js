const { calculateZScore, calculateVolatility } = require('../utils/math');
const { getTickerHistory, getLatestSnapshot, TICKER_METADATA } = require('./marketData');
const db = require('../config/database');

// Default Configurable weights for Attention Score components
const DEFAULT_WEIGHTS = {
  w1_relative_move: 2.5,     // Volatility-normalized move (z-score)
  w2_volume_anomaly: 1.8,    // Volume surge ratio
  w3_level_crossing: 2.2,    // 52-week high/low or 50d MA breakthrough
  w4_time_decay: 0.8         // Time away booster (up to ~1.0)
};

// Catalysts & Intelligence Database
const TICKER_CATALYSTS = {
  TSLA: [
    { headline: "Robotaxi Event Confirmed with Autonomous Cybercab Details", tag: "Bullish Catalyst", impact: 5, time: "2h ago" },
    { headline: "NHTSA closes hardware probe; FSD v13 rollout imminent", tag: "Regulatory Clear", impact: 4, time: "5h ago" },
    { headline: "Volume surge driven by 3.2x options gamma squeeze", tag: "Options Flow", impact: 4, time: "Today" }
  ],
  NVDA: [
    { headline: "Hyperscalers lift datacenter AI CapEx targets by 22% for 2025", tag: "Demand Surge", impact: 5, time: "1h ago" },
    { headline: "Blackwell chip server racks shipping ahead of initial schedule", tag: "Supply Chain", impact: 5, time: "4h ago" },
    { headline: "Breakthrough to new all-time 52-week high at $140.76", tag: "Technical Breakout", impact: 4, time: "Today" }
  ],
  AAPL: [
    { headline: "Apple Intelligence beta rollout spurs iPhone replacement cycle", tag: "Product Cycle", impact: 4, time: "3h ago" },
    { headline: "Services segment gross margins expand to record 74.2%", tag: "Margin Expansion", impact: 3, time: "6h ago" }
  ],
  MSFT: [
    { headline: "Azure OpenAI enterprise customer count tops 60,000 corporate clients", tag: "Cloud Growth", impact: 4, time: "2h ago" },
    { headline: "Constellation Energy nuclear power deal secures 20-year datacenter power", tag: "Infrastructure", impact: 4, time: "8h ago" }
  ],
  GOOGL: [
    { headline: "Gemini enterprise API volume expands 3x quarter-over-quarter", tag: "AI Scaling", impact: 4, time: "3h ago" },
    { headline: "Google Cloud profitability expands as custom TPU v5p deployment rises", tag: "Margin Expansion", impact: 4, time: "7h ago" }
  ],
  AMZN: [
    { headline: "AWS growth accelerates back to 19% YoY driven by GenAI workloads", tag: "Cloud Reacceleration", impact: 5, time: "4h ago" },
    { headline: "Custom Trainium2 silicon deployed across 100,000 server clusters", tag: "Silicon Efficiency", impact: 4, time: "9h ago" }
  ],
  META: [
    { headline: "Meta AI hits 400M monthly active users across WhatsApp & Instagram", tag: "User Engagement", impact: 5, time: "2h ago" },
    { headline: "Ad impression monetization yields lift 11% with automated AI targeting", tag: "Ad Revenue", impact: 4, time: "6h ago" }
  ],
  PLTR: [
    { headline: "AIP (Artificial Intelligence Platform) bootcamps convert 40+ US enterprises", tag: "Commercial Hypergrowth", impact: 5, time: "1h ago" },
    { headline: "Institutional accumulation following S&P 500 index weight balancing", tag: "Index Inflow", impact: 4, time: "5h ago" }
  ],
  COIN: [
    { headline: "Spot crypto ETF custody assets cross $70B threshold at Coinbase Prime", tag: "Institutional Custody", impact: 5, time: "2h ago" },
    { headline: "Base Layer-2 transaction fees generate annualized run-rate of $60M", tag: "L2 Revenue", impact: 4, time: "6h ago" }
  ],
  AMD: [
    { headline: "MI300X AI accelerator bookings revised upward to $4.5B for fiscal year", tag: "Datacenter AI", impact: 5, time: "3h ago" },
    { headline: "Next-gen Turin EPYC datacenter processors gain server socket share", tag: "Market Share Gain", impact: 4, time: "7h ago" }
  ],
  SMCI: [
    { headline: "Direct liquid cooling server shipments expand to 30% of total volume", tag: "Liquid Cooling", impact: 4, time: "4h ago" },
    { headline: "High volatility swing following quarterly earnings filing updates", tag: "Volatility Event", impact: 5, time: "6h ago" }
  ],
  // Indian Nifty 50 Catalysts (NSE/BSE)
  RELIANCE: [
    { headline: "Jio ARPU expands to ₹205 following nationwide 5G tariff optimization", tag: "Telecom Growth", impact: 5, time: "2h ago" },
    { headline: "Reliance Retail store count crosses 18,800 outlets with record footfalls", tag: "Retail Moat", impact: 4, time: "5h ago" },
    { headline: "Jamtara solar and battery storage gigafactory phase 1 commissioning", tag: "Clean Energy", impact: 4, time: "Today" }
  ],
  TCS: [
    { headline: "Secures multi-year $1.2B digital transformation deal with European bank", tag: "Mega Deal", impact: 5, time: "3h ago" },
    { headline: "Operating margins expand to 26.2% on disciplined offshore delivery pyramid", tag: "Margin Expansion", impact: 4, time: "6h ago" }
  ],
  HDFCBANK: [
    { headline: "Post-merger deposit growth accelerates to 16.5% YoY; CD ratio improves", tag: "Banking Balance", impact: 5, time: "2h ago" },
    { headline: "Net interest margins stabilize with retail loan underwriting expansion", tag: "NIM Rebound", impact: 4, time: "7h ago" }
  ],
  TATAMOTORS: [
    { headline: "Tata Passenger Electric captures 71% Indian EV market share with Curvv EV", tag: "EV Leadership", impact: 5, time: "1h ago" },
    { headline: "Jaguar Land Rover net debt reaches zero target ahead of fiscal guidance", tag: "Balance Sheet", impact: 5, time: "4h ago" }
  ],
  ZOMATO: [
    { headline: "Blinkit quick-commerce gross order value accelerates 130% YoY", tag: "Hypergrowth", impact: 5, time: "1h ago" },
    { headline: "Adjusted EBITDA profitability surges across quick commerce dark stores", tag: "Profitability", impact: 5, time: "3h ago" }
  ],
  INFY: [
    { headline: "Topaz GenAI suite expands to 300 active enterprise client contracts", tag: "Enterprise AI", impact: 4, time: "4h ago" },
    { headline: "Large deal TCV bookings cross $3.4B with strong North American traction", tag: "Deal Wins", impact: 4, time: "8h ago" }
  ],
  ICICIBANK: [
    { headline: "Return on Assets (RoA) hits 2.36% with robust domestic credit expansion", tag: "Asset Quality", impact: 5, time: "3h ago" },
    { headline: "Gross NPA declines to multi-year low of 2.15% with superior provisioning", tag: "Credit Safety", impact: 4, time: "6h ago" }
  ],
  ITC: [
    { headline: "Hotels business demerger unlock timeline confirmed for shareholder vote", tag: "Value Unlock", impact: 4, time: "3h ago" },
    { headline: "Non-cigarette FMCG revenues grow 12% driven by packaged foods & personal care", tag: "Diversification", impact: 4, time: "Today" }
  ]
};

// Institutional Bull vs Bear Thesis Directory
const TICKER_THESES = {
  TSLA: {
    bullRatio: 68,
    bull: {
      thesis: "Autonomous Cybercab Robotaxi platform and Megapack grid storage growth unlock a multi-trillion software TAM.",
      drivers: ["Full Self-Driving v13 commercial scaling", "Energy storage margin expansion > 25%", "Next-gen compact platform production"]
    },
    bear: {
      thesis: "Core automotive margins remain under pressure from intense global EV pricing competition and slower consumer adoption.",
      risks: ["Autonomous regulatory delays", "Heightened BYD and legacy competition", "Capital expenditure demands for AI compute"]
    }
  },
  NVDA: {
    bullRatio: 82,
    bull: {
      thesis: "CUDA software ecosystem and NVLink infrastructure create an insurmountable hardware-plus-software moat in AI computing.",
      drivers: ["Blackwell architecture sold out for 12+ months", "Enterprise AI software monetization", "Sovereign AI infrastructure investments"]
    },
    bear: {
      thesis: "Hyperscaler custom ASIC silicon (Trainium, TPU, Maia) could gradually erode merchant GPU market share by 2026.",
      risks: ["CapEx cyclicality digestion phase", "Supply chain concentration risk", "Geopolitical export limitations"]
    }
  },
  AAPL: {
    bullRatio: 74,
    bull: {
      thesis: "Apple Intelligence privacy-first architecture triggers the largest multi-year iPhone replacement upgrade cycle since 5G.",
      drivers: ["Services gross margin expansion (> 74%)", "2.2B active installed device base", "Massive share buyback program ($100B/yr)"]
    },
    bear: {
      thesis: "Smartphone hardware maturation and antitrust regulatory scrutiny on App Store take-rates threaten terminal growth.",
      risks: ["Greater China market share erosion", "Department of Justice antitrust litigation", "Delayed AI feature rollouts in Europe"]
    }
  },
  RELIANCE: {
    bullRatio: 78,
    bull: {
      thesis: "India's undisputed titan of Telecom, Retail, and Digital Services with massive free cash flow compounding and upcoming IPO value unlocks.",
      drivers: ["Jio 5G tariff monetization & fixed wireless home broadband", "Retail scale efficiencies & quick commerce foray", "Green hydrogen & gigafactory commissioning"]
    },
    bear: {
      thesis: "Elevated capital expenditure across green energy and 5G delays debt reduction and depresses consolidated return on capital.",
      risks: ["O2C refining margin volatility", "Heavy multi-year green energy CapEx gestation", "Regulatory scrutiny on telecom pricing"]
    }
  },
  ZOMATO: {
    bullRatio: 75,
    bull: {
      thesis: "Blinkit is capturing the modern Indian consumer's daily wallet share, creating an unassailable high-density quick commerce network.",
      drivers: ["Quick commerce dark store expansion to 2,000 locations", "Advertising take-rate expansion from FMCG brands", "Operating leverage as store economics mature"]
    },
    bear: {
      thesis: "Intense competitive spending from Zepto and Swiggy Instamart could trigger margin-dilutive price wars in key urban hubs.",
      risks: ["Delivery workforce wage inflation", "FMCG supply chain direct-to-consumer competition", "High valuation multiple expectations"]
    }
  },
  TATAMOTORS: {
    bullRatio: 72,
    bull: {
      thesis: "Unrivaled leadership in Indian passenger electric vehicles coupled with a net-debt-free Jaguar Land Rover driving record cash generation.",
      drivers: ["JLR order book backlog and high-margin Defender/Range Rover mix", "Commercial vehicle infrastructure upcycle in India", "Curvv and Sierra EV vehicle pipeline"]
    },
    bear: {
      thesis: "European luxury auto demand softness and domestic EV price competition could moderate EBITDA margins.",
      risks: ["Slowdown in UK/European premium automotive sales", "Increasing battery raw material volatility", "Domestic market share defense costs"]
    }
  },
  HDFCBANK: {
    bullRatio: 80,
    bull: {
      thesis: "India's premier private banking powerhouse with pristine credit quality, poised for re-rating as post-merger deposit growth accelerates.",
      drivers: ["Deposit mobilization catching up to asset growth", "Net Interest Margin (NIM) bottoming out", "Vast branch network delivering compounding cross-sell"]
    },
    bear: {
      thesis: "Higher credit-to-deposit ratio limits near-term loan growth momentum relative to faster-growing mid-tier private peers.",
      risks: ["Merger integration friction", "System-wide deposit competition elevating cost of funds", "Unsecured retail credit normalization"]
    }
  }
};

/**
 * Calculate the time decay boost based on hours elapsed since user last checked
 */
function calculateTimeDecayBoost(lastSeenTimestamp) {
  if (!lastSeenTimestamp) return 0.5;
  const now = Date.now();
  const lastSeen = new Date(lastSeenTimestamp).getTime();
  const hoursAway = Math.max(0, (now - lastSeen) / (1000 * 3600));

  if (hoursAway < 0.25) return 0.05; // Checked 15 mins ago
  if (hoursAway < 1) return 0.25;    // Checked < 1 hour ago
  if (hoursAway < 4) return 0.55;    // Checked a few hours ago
  if (hoursAway < 12) return 0.75;   // Checked earlier today
  return 1.0;                        // Away overnight or days
}

/**
 * Check if the price crossed 52w high, 52w low, or 50-day moving average
 */
function evaluateLevelCrossings(currentPrice, prevPrice, high52, low52, ma50) {
  const flags = [];

  if (high52 && currentPrice >= high52 && (!prevPrice || prevPrice < high52)) {
    flags.push({ type: '52W_HIGH', label: 'Crossed 52-Week High' });
  }
  if (low52 && currentPrice <= low52 && (!prevPrice || prevPrice > low52)) {
    flags.push({ type: '52W_LOW', label: 'Crossed 52-Week Low' });
  }
  if (ma50) {
    if (prevPrice && prevPrice < ma50 && currentPrice >= ma50) {
      flags.push({ type: 'MA50_BULL_CROSS', label: 'Broke above 50-day MA' });
    } else if (prevPrice && prevPrice > ma50 && currentPrice <= ma50) {
      flags.push({ type: 'MA50_BEAR_CROSS', label: 'Broke below 50-day MA' });
    }
  }

  return {
    crossed: flags.length > 0 ? 1 : 0,
    details: flags
  };
}

/**
 * Generate a concise, human-friendly plain English one-liner explaining why the stock moved
 */
function generateMovementStory(ticker, pctMove, volRatio, zScore, crossings, hoursAway) {
  const direction = pctMove >= 0 ? 'surged' : 'dropped';
  const sign = pctMove >= 0 ? '+' : '';
  const moveStr = `${sign}${pctMove.toFixed(1)}%`;
  const volStr = volRatio >= 1.5 ? `${volRatio.toFixed(1)}x average volume` : 'normal volume';

  const parts = [];

  if (zScore >= 2.5) {
    parts.push(`${ticker} ${direction} ${moveStr} on ${volStr}`);
  } else if (zScore >= 1.5) {
    parts.push(`${ticker} moved ${moveStr} on ${volStr}`);
  } else {
    parts.push(`${ticker} remained relatively quiet (${moveStr}) on ${volStr}`);
  }

  if (crossings.details.length > 0) {
    const crossLabel = crossings.details[0].label.toLowerCase();
    parts.push(`— ${crossLabel}`);
  } else if (zScore >= 2.0) {
    parts.push(`— abnormal move (${zScore.toFixed(1)}σ historical volatility)`);
  }

  if (hoursAway >= 2 && Math.abs(pctMove) >= 2.0) {
    const awayText = hoursAway >= 24 ? 'since yesterday' : `in the last ${Math.round(hoursAway)} hours`;
    return `${parts.join(' ')} ${awayText}.`;
  }

  return `${parts.join(' ')}.`;
}

/**
 * Calculate the complete Attention Score, catalysts, and diff for a single ticker
 */
function calculateTickerAttention(ticker, lastSeenAt = null, customWeights = null) {
  const history = getTickerHistory(ticker, 30);
  const latestSnapshot = getLatestSnapshot(ticker);

  if (!latestSnapshot) return null;

  const weights = { ...DEFAULT_WEIGHTS, ...(customWeights || {}) };

  const meta = TICKER_METADATA[ticker] || {
    name: ticker,
    high52: latestSnapshot.price * 1.2,
    low52: latestSnapshot.price * 0.8,
    ma50: latestSnapshot.price
  };

  let lastSeenSnapshot = null;
  if (lastSeenAt) {
    lastSeenSnapshot = db.get(
      'SELECT * FROM snapshots WHERE ticker = ? AND timestamp <= ? ORDER BY timestamp DESC LIMIT 1',
      [ticker, lastSeenAt]
    );
  }

  if (!lastSeenSnapshot) {
    const prevSnapshots = db.all(
      'SELECT * FROM snapshots WHERE ticker = ? ORDER BY id DESC LIMIT 2',
      [ticker]
    );
    lastSeenSnapshot = prevSnapshots.length > 1 ? prevSnapshots[1] : prevSnapshots[0];
  }

  const currentPrice = latestSnapshot.price;
  const currentVol = latestSnapshot.volume;
  const pctMove = latestSnapshot.pct_change_day;

  // 1. Relative Move Z-score: |move| / volatility
  const volatility = Math.max(0.3, history.volatility || 1.5);
  const relativeMoveZScore = Math.abs(pctMove) / volatility;

  // 2. Volume Anomaly Ratio: current vol / 30-day avg vol
  const avgVolume = Math.max(1, history.avgVolume || meta.baseVol || 20000000);
  const volumeAnomalyRatio = currentVol / avgVolume;

  // 3. Level Crossing Flag
  const prevPrice = lastSeenSnapshot ? lastSeenSnapshot.price : currentPrice;
  const crossings = evaluateLevelCrossings(
    currentPrice,
    prevPrice,
    latestSnapshot.high_52w || meta.high52,
    latestSnapshot.low_52w || meta.low52,
    latestSnapshot.ma_50d || meta.ma50
  );

  // 4. Time Decay
  const hoursAway = lastSeenAt ? Math.max(0, (Date.now() - new Date(lastSeenAt).getTime()) / (1000 * 3600)) : 1;
  const timeDecayBoost = calculateTimeDecayBoost(lastSeenAt);

  // Attention Score formula with tunable weights
  const attentionScore = parseFloat((
    weights.w1_relative_move * relativeMoveZScore +
    weights.w2_volume_anomaly * Math.min(volumeAnomalyRatio, 4.0) +
    weights.w3_level_crossing * crossings.crossed +
    weights.w4_time_decay * timeDecayBoost
  ).toFixed(2));

  // Diff since user last checked
  const priceDiff = parseFloat((currentPrice - (lastSeenSnapshot?.price || currentPrice)).toFixed(2));
  const pctDiffSinceLastSeen = lastSeenSnapshot?.price 
    ? parseFloat((((currentPrice - lastSeenSnapshot.price) / lastSeenSnapshot.price) * 100).toFixed(2))
    : pctMove;

  const narrative = generateMovementStory(
    ticker,
    pctMove,
    volumeAnomalyRatio,
    relativeMoveZScore,
    crossings,
    hoursAway
  );

  // Get catalysts
  const catalysts = TICKER_CATALYSTS[ticker] || [
    { headline: `${ticker} algorithmic flow driven by sector momentum rebalance`, tag: "Algorithmic Flow", impact: 3, time: "Today" },
    { headline: `Options implied volatility percentile elevated at ${(volatility * 20).toFixed(0)}%`, tag: "Derivatives", impact: 3, time: "Earlier" }
  ];

  return {
    ticker,
    name: meta.name,
    sector: meta.sector || 'Equities',
    price: currentPrice,
    pctChangeDay: pctMove,
    volume: currentVol,
    avgVolume,
    high52: latestSnapshot.high_52w || meta.high52,
    low52: latestSnapshot.low_52w || meta.low52,
    ma50: latestSnapshot.ma_50d || meta.ma50,
    volatility: parseFloat(volatility.toFixed(2)),
    sparkline: history.points.slice(-10).map(p => ({ price: p.price, date: p.date })),
    
    attentionScore,
    scoreBreakdown: {
      relativeMoveZScore: parseFloat(relativeMoveZScore.toFixed(2)),
      volumeAnomalyRatio: parseFloat(volumeAnomalyRatio.toFixed(2)),
      levelCrossings: crossings.details,
      timeDecayBoost: parseFloat(timeDecayBoost.toFixed(2)),
      appliedWeights: weights
    },
    
    diffSinceLastSeen: {
      previousPrice: lastSeenSnapshot?.price || currentPrice,
      priceDelta: priceDiff,
      pctDelta: pctDiffSinceLastSeen,
      isSignificant: Math.abs(pctDiffSinceLastSeen) >= 1.5 || volumeAnomalyRatio >= 1.8
    },

    narrative,
    catalysts,
    theses: TICKER_THESES[ticker] || {
      bullRatio: 65,
      bull: {
        thesis: `${meta.name} exhibits positive relative momentum and robust sector tailwinds.`,
        drivers: ["Strong operating leverage", "Capital reinvestment efficiency", "Favorable institutional positioning"]
      },
      bear: {
        thesis: `Macroeconomic sensitivity and broader market beta could pose short-term volatility.`,
        risks: ["Multiple compression risk", "Competitive disruption", "Broad market headwinds"]
      }
    },
    currency: meta.currency || 'USD',
    symbolPrefix: meta.symbolPrefix || '$',
    updatedAt: latestSnapshot.timestamp
  };
}

/**
 * Generate triage feed for a list of tickers
 * Partitions into "Needs your attention" and "Quiet"
 */
function buildWatchlistFeed(tickers, lastSeenAt = null, customWeights = null) {
  const items = [];

  for (const ticker of tickers) {
    const attentionData = calculateTickerAttention(ticker, lastSeenAt, customWeights);
    if (attentionData) {
      items.push(attentionData);
    }
  }

  // Sort strictly by attention score descending
  items.sort((a, b) => b.attentionScore - a.attentionScore);

  // Triage partition:
  // Top 2-3 items OR items with attention score >= 4.0 go to "Needs Attention"
  const needsAttention = [];
  const quiet = [];

  const ATTENTION_THRESHOLD = 4.0;
  const MIN_ATTENTION_COUNT = Math.min(2, items.length);

  items.forEach((item, index) => {
    if (index < MIN_ATTENTION_COUNT || item.attentionScore >= ATTENTION_THRESHOLD) {
      needsAttention.push(item);
    } else {
      quiet.push(item);
    }
  });

  return {
    needsAttention,
    quiet,
    totalCount: items.length,
    attentionCount: needsAttention.length,
    quietCount: quiet.length,
    asOf: new Date().toISOString(),
    appliedWeights: customWeights || DEFAULT_WEIGHTS
  };
}

module.exports = {
  DEFAULT_WEIGHTS,
  calculateTickerAttention,
  buildWatchlistFeed,
  calculateTimeDecayBoost
};
