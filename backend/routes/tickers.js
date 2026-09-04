const express = require('express');
const { getTickerHistory, getLatestSnapshot, triggerMarketShock, TICKER_METADATA } = require('../services/marketData');
const { getStockQuote } = require('../services/finnhub');

const router = express.Router();

// Get 30-day historical points for Recharts
router.get('/:ticker/history', (req, res) => {
  const ticker = req.params.ticker.toUpperCase().trim();
  const days = parseInt(req.query.days) || 30;

  try {
    const history = getTickerHistory(ticker, days);
    const meta = TICKER_METADATA[ticker] || { name: ticker, sector: 'Equities' };

    res.json({
      ticker,
      name: meta.name,
      sector: meta.sector,
      ...history
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve price history.' });
  }
});

// Get current quote
router.get('/:ticker/quote', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase().trim();
  try {
    const quote = await getStockQuote(ticker);
    res.json({ quote });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve quote.' });
  }
});

// Trigger simulated market shock for instant judge demo
router.post('/simulate-shock', (req, res) => {
  const { ticker = 'TSLA', shockPct = 5.2, volumeBoost = 2.8 } = req.body;
  const cleanTicker = ticker.toUpperCase().trim();

  try {
    const updated = triggerMarketShock(cleanTicker, parseFloat(shockPct), parseFloat(volumeBoost));
    res.json({
      message: `Simulated market shock applied to ${cleanTicker}`,
      snapshot: updated
    });
  } catch (err) {
    console.error('Shock simulation error:', err);
    res.status(500).json({ error: 'Failed to simulate market shock.' });
  }
});

module.exports = router;
