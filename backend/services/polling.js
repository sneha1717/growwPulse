const db = require('../config/database');
const { recordSnapshot, getLatestSnapshot, triggerMarketShock, TICKER_METADATA } = require('./marketData');
const { getStockQuote, batchFetchQuotes, getFinnhubStatus } = require('./finnhub');

let isPolling = false;
let lastPolledAt = new Date().toISOString();

/**
 * Get all unique tickers actively tracked in any watchlist
 */
function getTrackedTickers() {
  const rows = db.all('SELECT DISTINCT ticker FROM watchlist_items');
  const tickers = rows.map(r => r.ticker);
  if (tickers.length === 0) {
    return ['NVDA', 'AMZN', 'GOOGL', 'META', 'AAPL', 'TSLA'];
  }
  return tickers;
}

/**
 * Poll market data for all tracked tickers
 */
async function pollTrackedTickers() {
  if (isPolling) return;
  isPolling = true;

  try {
    const tickers = getTrackedTickers();

    if (process.env.FINNHUB_API_KEY) {
      // Real live Wall Street feed from Finnhub /quote API
      await batchFetchQuotes(tickers);
    } else {
      // High-fidelity market simulation when no external API key is provided
      for (const ticker of tickers) {
        const latest = getLatestSnapshot(ticker);
        const meta = TICKER_METADATA[ticker] || { basePrice: 100, high52: 120, low52: 80, ma50: 95 };
        
        const prevPrice = latest ? latest.price : meta.basePrice;
        // Minor realistic tick +/- 0.12%
        const tickMove = (Math.random() - 0.49) * 0.24;
        const newPrice = parseFloat((prevPrice * (1 + tickMove / 100)).toFixed(2));
        const newPctChange = parseFloat(((latest ? latest.pct_change_day : 0) + tickMove * 0.4).toFixed(2));
        const newVol = (latest ? latest.volume : 10000000) + Math.round(Math.random() * 40000);

        recordSnapshot(
          ticker,
          newPrice,
          newVol,
          newPctChange,
          latest?.high_52w || meta.high52,
          latest?.low_52w || meta.low52,
          latest?.ma_50d || meta.ma50
        );
      }
    }

    lastPolledAt = new Date().toISOString();
  } catch (err) {
    console.error('Polling worker error:', err);
  } finally {
    isPolling = false;
  }
}

/**
 * Start the background polling interval (every 20s as requested by Step 4)
 */
function startPollingWorker(intervalMs = 20000) {
  console.log(`⏱️ Market Polling Worker active (interval: ${intervalMs / 1000}s)`);
  // Immediate fetch on startup
  pollTrackedTickers();
  // Continuous interval
  const timer = setInterval(pollTrackedTickers, intervalMs);
  return timer;
}

module.exports = {
  pollTrackedTickers,
  startPollingWorker,
  getLastPolledAt: () => lastPolledAt,
  triggerShock: triggerMarketShock,
  getFinnhubStatus
};
