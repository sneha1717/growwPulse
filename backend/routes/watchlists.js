const express = require('express');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { TICKER_METADATA, recordSnapshot } = require('../services/marketData');

const router = express.Router();

// Search tickers
router.get('/search', (req, res) => {
  const query = (req.query.q || '').toUpperCase().trim();
  const results = Object.entries(TICKER_METADATA)
    .filter(([ticker, meta]) => {
      if (!query) return true;
      return ticker.includes(query) || meta.name.toUpperCase().includes(query) || meta.sector.toUpperCase().includes(query);
    })
    .slice(0, 10)
    .map(([ticker, meta]) => ({
      ticker,
      name: meta.name,
      sector: meta.sector,
      basePrice: meta.basePrice
    }));

  res.json({ results });
});

// List all watchlists for authenticated user
router.get('/', requireAuth, (req, res) => {
  try {
    const watchlists = db.all(
      'SELECT id, name, description, created_at FROM watchlists WHERE user_id = ? ORDER BY id ASC',
      [req.user.id]
    );

    const enriched = watchlists.map(wl => {
      const items = db.all(
        'SELECT ticker, added_at FROM watchlist_items WHERE watchlist_id = ? ORDER BY id ASC',
        [wl.id]
      );
      return {
        ...wl,
        itemsCount: items.length,
        tickers: items.map(i => i.ticker)
      };
    });

    res.json({ watchlists: enriched });
  } catch (err) {
    console.error('List watchlists error:', err);
    res.status(500).json({ error: 'Failed to retrieve watchlists.' });
  }
});

// Create new watchlist
router.post('/', requireAuth, (req, res) => {
  const { name, description, initialTickers } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Watchlist name is required.' });
  }

  try {
    const result = db.run(
      'INSERT INTO watchlists (user_id, name, description) VALUES (?, ?, ?)',
      [req.user.id, name.trim(), description || '']
    );
    const watchlistId = result.lastInsertRowid;

    if (Array.isArray(initialTickers)) {
      for (const t of initialTickers) {
        const cleanTicker = t.toUpperCase().trim();
        if (cleanTicker) {
          db.run(
            'INSERT OR IGNORE INTO watchlist_items (watchlist_id, ticker) VALUES (?, ?)',
            [watchlistId, cleanTicker]
          );
        }
      }
    }

    res.status(201).json({
      watchlist: {
        id: watchlistId,
        name: name.trim(),
        description: description || '',
        itemsCount: (initialTickers || []).length
      }
    });
  } catch (err) {
    console.error('Create watchlist error:', err);
    res.status(500).json({ error: 'Failed to create watchlist.' });
  }
});

// Get single watchlist
router.get('/:id', requireAuth, (req, res) => {
  try {
    const watchlist = db.get(
      'SELECT * FROM watchlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found.' });
    }

    const items = db.all(
      'SELECT id, ticker, added_at FROM watchlist_items WHERE watchlist_id = ? ORDER BY id ASC',
      [watchlist.id]
    );

    res.json({
      watchlist: {
        ...watchlist,
        items
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watchlist.' });
  }
});

// Delete watchlist
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const watchlist = db.get(
      'SELECT id FROM watchlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found.' });
    }

    db.run('DELETE FROM watchlists WHERE id = ?', [req.params.id]);
    res.json({ message: 'Watchlist deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete watchlist.' });
  }
});

// Add ticker to watchlist
router.post('/:id/items', requireAuth, (req, res) => {
  const { ticker } = req.body;
  if (!ticker || !ticker.trim()) {
    return res.status(400).json({ error: 'Ticker symbol is required.' });
  }

  const cleanTicker = ticker.toUpperCase().trim();

  try {
    const watchlist = db.get(
      'SELECT id FROM watchlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found.' });
    }

    // Ensure initial snapshot exists for this ticker if newly added
    const existingSnap = db.get('SELECT id FROM snapshots WHERE ticker = ? LIMIT 1', [cleanTicker]);
    if (!existingSnap) {
      const meta = TICKER_METADATA[cleanTicker] || {
        basePrice: 150.0,
        baseVol: 25000000,
        high52: 180.0,
        low52: 110.0,
        ma50: 145.0
      };
      recordSnapshot(cleanTicker, meta.basePrice, meta.baseVol, 0.5, meta.high52, meta.low52, meta.ma50);
    }

    db.run(
      'INSERT OR IGNORE INTO watchlist_items (watchlist_id, ticker) VALUES (?, ?)',
      [watchlist.id, cleanTicker]
    );

    res.status(201).json({ message: `Added ${cleanTicker} to watchlist.`, ticker: cleanTicker });
  } catch (err) {
    console.error('Add item error:', err);
    res.status(500).json({ error: 'Failed to add ticker.' });
  }
});

// Remove ticker from watchlist
router.delete('/:id/items/:ticker', requireAuth, (req, res) => {
  const cleanTicker = req.params.ticker.toUpperCase().trim();

  try {
    const watchlist = db.get(
      'SELECT id FROM watchlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found.' });
    }

    db.run(
      'DELETE FROM watchlist_items WHERE watchlist_id = ? AND ticker = ?',
      [watchlist.id, cleanTicker]
    );

    res.json({ message: `Removed ${cleanTicker} from watchlist.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove ticker.' });
  }
});

module.exports = router;
