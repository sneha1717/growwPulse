const db = require('../config/database');
const { calculateVolatility } = require('../utils/math');

// Master ticker directory with fundamentals and sector classifications
const TICKER_METADATA = {
  // US Markets Universe
  NVDA: { name: 'NVIDIA Corporation', sector: 'Semiconductors', currency: 'USD', symbolPrefix: '$', basePrice: 128.50, baseVol: 45000000, high52: 140.76, low52: 45.12, ma50: 122.30 },
  TSLA: { name: 'Tesla, Inc.', sector: 'Automotive / EV', currency: 'USD', symbolPrefix: '$', basePrice: 245.20, baseVol: 85000000, high52: 271.00, low52: 138.80, ma50: 232.10 },
  AAPL: { name: 'Apple Inc.', sector: 'Consumer Tech', currency: 'USD', symbolPrefix: '$', basePrice: 228.40, baseVol: 42000000, high52: 237.23, low52: 164.08, ma50: 224.50 },
  MSFT: { name: 'Microsoft Corporation', sector: 'Software & Cloud', currency: 'USD', symbolPrefix: '$', basePrice: 421.10, baseVol: 19000000, high52: 468.35, low52: 309.45, ma50: 418.00 },
  GOOGL: { name: 'Alphabet Inc.', sector: 'Internet Services', currency: 'USD', symbolPrefix: '$', basePrice: 164.80, baseVol: 24000000, high52: 191.75, low52: 120.21, ma50: 168.20 },
  AMZN: { name: 'Amazon.com, Inc.', sector: 'E-Commerce / Cloud', currency: 'USD', symbolPrefix: '$', basePrice: 186.30, baseVol: 31000000, high52: 201.20, low52: 118.35, ma50: 182.40 },
  META: { name: 'Meta Platforms, Inc.', sector: 'Social Media / AI', currency: 'USD', symbolPrefix: '$', basePrice: 524.60, baseVol: 14000000, high52: 544.23, low52: 279.40, ma50: 504.80 },
  PLTR: { name: 'Palantir Technologies', sector: 'Enterprise AI', currency: 'USD', symbolPrefix: '$', basePrice: 38.40, baseVol: 55000000, high52: 44.50, low52: 14.48, ma50: 32.10 },
  COIN: { name: 'Coinbase Global, Inc.', sector: 'Crypto Infrastructure', currency: 'USD', symbolPrefix: '$', basePrice: 212.80, baseVol: 12000000, high52: 283.48, low52: 69.63, ma50: 208.50 },
  AMD: { name: 'Advanced Micro Devices', sector: 'Semiconductors', currency: 'USD', symbolPrefix: '$', basePrice: 148.90, baseVol: 38000000, high52: 227.30, low52: 94.04, ma50: 146.20 },
  ARM: { name: 'Arm Holdings plc', sector: 'Semiconductors', currency: 'USD', symbolPrefix: '$', basePrice: 132.50, baseVol: 16000000, high52: 188.75, low52: 46.50, ma50: 129.80 },
  SMCI: { name: 'Super Micro Computer', sector: 'AI Servers', currency: 'USD', symbolPrefix: '$', basePrice: 42.10, baseVol: 28000000, high52: 122.90, low52: 24.10, ma50: 46.50 },
  NFLX: { name: 'Netflix, Inc.', sector: 'Entertainment', currency: 'USD', symbolPrefix: '$', basePrice: 694.00, baseVol: 3200000, high52: 711.33, low52: 371.83, ma50: 672.40 },
  SPY: { name: 'SPDR S&P 500 ETF Trust', sector: 'Broad Market ETF', currency: 'USD', symbolPrefix: '$', basePrice: 562.30, baseVol: 48000000, high52: 565.16, low52: 410.07, ma50: 552.80 },
  QQQ: { name: 'Invesco QQQ Trust', sector: 'Nasdaq 100 ETF', currency: 'USD', symbolPrefix: '$', basePrice: 482.50, baseVol: 35000000, high52: 503.52, low52: 351.36, ma50: 476.90 },

  // Indian Nifty 50 Giants (Homage to Groww Platform)
  RELIANCE: { name: 'Reliance Industries Ltd.', sector: 'Energy & Retail (NSE)', currency: 'INR', symbolPrefix: '₹', basePrice: 2985.40, baseVol: 8200000, high52: 3217.90, low52: 2220.30, ma50: 2940.00 },
  TCS: { name: 'Tata Consultancy Services', sector: 'IT Services (NSE)', currency: 'INR', symbolPrefix: '₹', basePrice: 4320.50, baseVol: 2400000, high52: 4592.25, low52: 3313.00, ma50: 4280.00 },
  HDFCBANK: { name: 'HDFC Bank Limited', sector: 'Banking & Finance (NSE)', currency: 'INR', symbolPrefix: '₹', basePrice: 1654.10, baseVol: 18500000, high52: 1794.00, low52: 1363.55, ma50: 1620.00 },
  INFY: { name: 'Infosys Limited', sector: 'IT Services (NSE)', currency: 'INR', symbolPrefix: '₹', basePrice: 1892.30, baseVol: 7200000, high52: 1974.70, low52: 1358.35, ma50: 1850.00 },
  TATAMOTORS: { name: 'Tata Motors Limited', sector: 'Auto & EV (NSE)', currency: 'INR', symbolPrefix: '₹', basePrice: 985.60, baseVol: 11200000, high52: 1179.05, low52: 593.50, ma50: 970.00 },
  ICICIBANK: { name: 'ICICI Bank Limited', sector: 'Banking (NSE)', currency: 'INR', symbolPrefix: '₹', basePrice: 1242.80, baseVol: 14200000, high52: 1300.00, low52: 914.00, ma50: 1210.00 },
  ZOMATO: { name: 'Zomato Limited', sector: 'Quick Commerce / Tech (NSE)', currency: 'INR', symbolPrefix: '₹', basePrice: 268.40, baseVol: 45000000, high52: 298.20, low52: 98.40, ma50: 252.00 },
  ITC: { name: 'ITC Limited', sector: 'FMCG / Hotels (NSE)', currency: 'INR', symbolPrefix: '₹', basePrice: 504.70, baseVol: 12500000, high52: 526.00, low52: 399.30, ma50: 495.00 }
};

/**
 * Seed 30 days of realistic historical snapshots for all known tickers
 */
function seedHistoricalSnapshots() {
  const insertStmt = db.raw.prepare(`
    INSERT INTO snapshots (ticker, price, volume, pct_change_day, high_52w, low_52w, ma_50d, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  const ONE_DAY = 24 * 3600 * 1000;

  db.transaction(() => {
    for (const [ticker, meta] of Object.entries(TICKER_METADATA)) {
      const row = db.get('SELECT COUNT(*) as count FROM snapshots WHERE ticker = ?', [ticker]);
      if (row && row.count > 10) continue;

      let currentPrice = meta.basePrice * 0.92;
      let previousPrice = currentPrice;

      for (let day = 30; day >= 0; day--) {
        const timestamp = new Date(now - day * ONE_DAY).toISOString();
        const seedVal = Math.sin(day * 1.7 + ticker.charCodeAt(0) * 0.5);
        let finalMovePct = seedVal * 2.8;
        let volumeMultiplier = 1.0;

        if (day === 0) {
          if (ticker === 'TSLA') {
            finalMovePct = 5.42;
            volumeMultiplier = 3.2;
          } else if (ticker === 'NVDA') {
            finalMovePct = 4.15;
            volumeMultiplier = 2.4;
          } else if (ticker === 'ZOMATO') {
            finalMovePct = 6.45; // Zomato Blinkit quick-commerce surge
            volumeMultiplier = 3.5;
          } else if (ticker === 'RELIANCE') {
            finalMovePct = 2.85; // Reliance Retail/Jio growth
            volumeMultiplier = 2.1;
          } else if (ticker === 'TATAMOTORS') {
            finalMovePct = 4.10; // Tata Motors EV market share expansion
            volumeMultiplier = 2.6;
          } else if (ticker === 'HDFCBANK') {
            finalMovePct = -0.35;
            volumeMultiplier = 0.9;
          }
        }

        currentPrice = parseFloat((previousPrice * (1 + finalMovePct / 100)).toFixed(2));
        const dayVol = Math.round(meta.baseVol * volumeMultiplier * (0.85 + Math.abs(seedVal) * 0.3));

        insertStmt.run(
          ticker,
          currentPrice,
          dayVol,
          parseFloat(finalMovePct.toFixed(2)),
          meta.high52,
          meta.low52,
          meta.ma50,
          timestamp
        );

        previousPrice = currentPrice;
      }
    }
  })();

  console.log('✅ Market snapshots verified and seeded.');
}

seedHistoricalSnapshots();

/**
 * Get the latest snapshot for a ticker
 */
function getLatestSnapshot(ticker) {
  return db.get(
    'SELECT * FROM snapshots WHERE ticker = ? ORDER BY id DESC LIMIT 1',
    [ticker]
  );
}

/**
 * Get 30-day price history for Recharts line chart and correlation
 */
function getTickerHistory(ticker, limit = 30) {
  const rows = db.all(
    `SELECT price, volume, pct_change_day, timestamp 
     FROM snapshots 
     WHERE ticker = ? 
     ORDER BY id DESC 
     LIMIT ?`,
    [ticker, limit]
  );

  const chronological = rows.reverse();
  const dailyReturns = chronological.map(r => r.pct_change_day);
  const volatility = calculateVolatility(dailyReturns);

  return {
    ticker,
    points: chronological.map(r => ({
      date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: r.timestamp,
      price: r.price,
      volume: r.volume,
      pctChange: r.pct_change_day
    })),
    dailyReturns,
    volatility,
    avgVolume: Math.round(chronological.reduce((acc, r) => acc + r.volume, 0) / (chronological.length || 1))
  };
}

/**
 * Record a new snapshot for a ticker
 */
function recordSnapshot(ticker, price, volume, pctChangeDay, high52, low52, ma50) {
  const meta = TICKER_METADATA[ticker] || { high52: price * 1.2, low52: price * 0.8, ma50: price };
  const nowIso = new Date().toISOString();
  return db.run(
    `INSERT INTO snapshots (ticker, price, volume, pct_change_day, high_52w, low_52w, ma_50d, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ticker,
      parseFloat(price.toFixed(2)),
      volume,
      parseFloat(pctChangeDay.toFixed(2)),
      high52 || meta.high52,
      low52 || meta.low52,
      ma50 || meta.ma50,
      nowIso
    ]
  );
}

/**
 * Trigger a simulated market shock for instant judge demonstration
 */
function triggerMarketShock(ticker, shockPct = 4.8, volumeBoost = 2.5) {
  const latest = getLatestSnapshot(ticker) || { price: 100, volume: 10000000, pct_change_day: 0 };
  const newPrice = latest.price * (1 + shockPct / 100);
  const newPct = latest.pct_change_day + shockPct;
  const newVol = Math.round(latest.volume * volumeBoost);
  
  recordSnapshot(ticker, newPrice, newVol, newPct, latest.high_52w, latest.low_52w, latest.ma_50d);
  return getLatestSnapshot(ticker);
}

module.exports = {
  TICKER_METADATA,
  getLatestSnapshot,
  getTickerHistory,
  recordSnapshot,
  triggerMarketShock
};
