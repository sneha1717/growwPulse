const express = require('express');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { getTickerHistory, getLatestSnapshot } = require('../services/marketData');
const { calculateCorrelationMatrix, calculateHealthScore } = require('../utils/math');
const { buildWatchlistFeed } = require('../services/attention');

const router = express.Router();

/**
 * GET /api/watchlists/:id/correlation
 * Returns Pearson correlation matrix between all pairs of stocks in the watchlist
 */
router.get('/:id/correlation', requireAuth, (req, res) => {
  try {
    const watchlist = db.get(
      'SELECT id, name FROM watchlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!watchlist) return res.status(404).json({ error: 'Watchlist not found.' });

    const items = db.all(
      'SELECT ticker FROM watchlist_items WHERE watchlist_id = ?',
      [watchlist.id]
    );
    const tickers = items.map(i => i.ticker);

    if (tickers.length < 2) {
      return res.json({
        tickers,
        matrix: {},
        pairs: [],
        insufficientData: true
      });
    }

    const historyMap = {};
    for (const t of tickers) {
      historyMap[t] = getTickerHistory(t, 30);
    }

    const matrix = calculateCorrelationMatrix(tickers, historyMap);

    // Flatten for easy heatmap grid consumption
    const pairs = [];
    for (let i = 0; i < tickers.length; i++) {
      for (let j = 0; j < tickers.length; j++) {
        pairs.push({
          tickerA: tickers[i],
          tickerB: tickers[j],
          correlation: matrix[tickers[i]][tickers[j]]
        });
      }
    }

    res.json({
      watchlist,
      tickers,
      matrix,
      pairs
    });
  } catch (err) {
    console.error('Correlation calculation error:', err);
    res.status(500).json({ error: 'Failed to compute correlation matrix.' });
  }
});

/**
 * GET /api/watchlists/:id/health
 * Returns Watchlist Health Score (0-100) & risk breakdown
 */
router.get('/:id/health', requireAuth, (req, res) => {
  try {
    const watchlist = db.get(
      'SELECT id, name FROM watchlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!watchlist) return res.status(404).json({ error: 'Watchlist not found.' });

    const items = db.all(
      'SELECT ticker FROM watchlist_items WHERE watchlist_id = ?',
      [watchlist.id]
    );
    const tickers = items.map(i => i.ticker);

    const itemsData = [];
    const historyMap = {};

    for (const t of tickers) {
      const snap = getLatestSnapshot(t);
      const hist = getTickerHistory(t, 30);
      historyMap[t] = hist;
      if (snap) {
        itemsData.push({
          ticker: t,
          pct_change_day: snap.pct_change_day,
          volatility: hist.volatility
        });
      }
    }

    const matrix = calculateCorrelationMatrix(tickers, historyMap);
    const health = calculateHealthScore(itemsData, matrix);

    res.json({
      watchlist,
      health
    });
  } catch (err) {
    console.error('Health calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate health score.' });
  }
});

/**
 * GET /api/watchlists/:id/timeline
 * Interactive Attention Timeline Scrubber data
 * Provides historical snapshots at: 'now', '1h', '4h', 'yesterday', '3d', '1w'
 */
router.get('/:id/timeline', requireAuth, (req, res) => {
  try {
    const watchlist = db.get(
      'SELECT id, name FROM watchlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!watchlist) return res.status(404).json({ error: 'Watchlist not found.' });

    const items = db.all('SELECT ticker FROM watchlist_items WHERE watchlist_id = ?', [watchlist.id]);
    const tickers = items.map(i => i.ticker);

    const now = Date.now();
    const intervals = [
      { id: 'now', label: 'Live Now', timestamp: new Date(now).toISOString() },
      { id: '1h', label: '1 Hour Ago', timestamp: new Date(now - 1 * 3600 * 1000).toISOString() },
      { id: '4h', label: '4 Hours Ago', timestamp: new Date(now - 4 * 3600 * 1000).toISOString() },
      { id: 'yesterday', label: 'Yesterday', timestamp: new Date(now - 24 * 3600 * 1000).toISOString() },
      { id: '3d', label: '3 Days Ago', timestamp: new Date(now - 3 * 24 * 3600 * 1000).toISOString() },
      { id: '1w', label: '1 Week Ago', timestamp: new Date(now - 7 * 24 * 3600 * 1000).toISOString() }
    ];

    const slices = intervals.map(interval => {
      const feed = buildWatchlistFeed(tickers, interval.timestamp);
      return {
        id: interval.id,
        label: interval.label,
        timestamp: interval.timestamp,
        topAttentionTicker: feed.needsAttention[0]?.ticker || tickers[0] || 'N/A',
        topAttentionScore: feed.needsAttention[0]?.attentionScore || 0,
        attentionCount: feed.attentionCount,
        feed
      };
    });

    res.json({
      watchlist,
      slices
    });
  } catch (err) {
    console.error('Timeline generation error:', err);
    res.status(500).json({ error: 'Failed to generate timeline scrubber data.' });
  }
});

module.exports = router;
