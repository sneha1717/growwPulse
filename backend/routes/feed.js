const express = require('express');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { buildWatchlistFeed } = require('../services/attention');
const { getLastPolledAt, getFinnhubStatus } = require('../services/polling');

const router = express.Router();

/**
 * GET /api/watchlists/:id/feed
 * Ranked triage feed with live Finnhub quote status & last successful fetch timestamp
 */
router.get('/:id/feed', requireAuth, (req, res) => {
  try {
    const watchlist = db.get(
      'SELECT id, name, description FROM watchlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found.' });
    }

    const items = db.all(
      'SELECT ticker FROM watchlist_items WHERE watchlist_id = ?',
      [watchlist.id]
    );

    const finnhubInfo = getFinnhubStatus();

    if (items.length === 0) {
      return res.json({
        watchlist,
        needsAttention: [],
        quiet: [],
        totalCount: 0,
        asOf: new Date().toISOString(),
        lastSeenAt: null,
        isEmpty: true,
        finnhub: finnhubInfo
      });
    }

    // Parse optional custom weights
    let customWeights = null;
    if (req.query.w1 !== undefined || req.query.w2 !== undefined || req.query.w3 !== undefined || req.query.w4 !== undefined) {
      customWeights = {
        w1_relative_move: parseFloat(req.query.w1) || 2.5,
        w2_volume_anomaly: parseFloat(req.query.w2) || 1.8,
        w3_level_crossing: parseFloat(req.query.w3) || 2.2,
        w4_time_decay: parseFloat(req.query.w4) || 0.8
      };
    }

    const sessions = db.all(
      'SELECT last_seen_at FROM user_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 2',
      [req.user.id]
    );
    const lastSeenAt = sessions.length > 1 ? sessions[1].last_seen_at : sessions[0]?.last_seen_at;

    const tickers = items.map(i => i.ticker);
    const feed = buildWatchlistFeed(tickers, lastSeenAt, customWeights);

    const lastPolled = new Date(getLastPolledAt()).getTime();
    const isStale = (Date.now() - lastPolled) > 120000;
    const isDataDelayed = finnhubInfo.fetchStatus === 'RATE_LIMITED' || finnhubInfo.fetchStatus === 'DATA_DELAYED';

    // Last successful fetch time: use Finnhub's last successful fetch timestamp if available
    const lastSuccessfulTime = finnhubInfo.lastSuccessfulFetchAt || feed.asOf;
    const formattedLastSuccessful = new Date(lastSuccessfulTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    res.json({
      watchlist,
      needsAttention: feed.needsAttention,
      quiet: feed.quiet,
      totalCount: feed.totalCount,
      attentionCount: feed.attentionCount,
      quietCount: feed.quietCount,
      lastSeenAt,
      asOf: feed.asOf,
      lastSuccessfulFetchAt: lastSuccessfulTime,
      lastSuccessfulFetchFormatted: formattedLastSuccessful,
      isStale,
      isDataDelayed,
      finnhub: {
        ...finnhubInfo,
        feedSourceLabel: finnhubInfo.fetchStatus === 'LIVE_FINNHUB'
          ? 'Finnhub Live Quote Feed'
          : finnhubInfo.fetchStatus === 'RATE_LIMITED'
          ? 'Finnhub (Rate Limited / Cached)'
          : finnhubInfo.hasKey
          ? 'Finnhub Cached Data'
          : 'Pulse High-Fidelity Simulator'
      },
      appliedWeights: feed.appliedWeights,
      asOfFormatted: new Date(feed.asOf).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  } catch (err) {
    console.error('Feed generation error:', err);
    res.status(500).json({ error: 'Failed to generate watchlist feed.' });
  }
});

module.exports = router;
