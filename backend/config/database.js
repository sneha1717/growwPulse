const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'pulse.db');
const sqlite = new Database(DB_PATH);

// Pragmas for SQLite performance and safety
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Unified DB helper wrapping SQLite operations
const db = {
  raw: sqlite,
  isPostgres: false,

  run(sql, params = []) {
    const stmt = sqlite.prepare(sql);
    return stmt.run(...params);
  },

  get(sql, params = []) {
    const stmt = sqlite.prepare(sql);
    return stmt.get(...params);
  },

  all(sql, params = []) {
    const stmt = sqlite.prepare(sql);
    return stmt.all(...params);
  },

  exec(sql) {
    return sqlite.exec(sql);
  },

  transaction(fn) {
    return sqlite.transaction(fn);
  }
};

// Initialize tables if they do not exist
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS watchlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS watchlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      watchlist_id INTEGER NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
      ticker TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(watchlist_id, ticker)
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      price REAL NOT NULL,
      volume INTEGER NOT NULL,
      pct_change_day REAL NOT NULL,
      high_52w REAL,
      low_52w REAL,
      ma_50d REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_ticker_time ON snapshots(ticker, timestamp);

    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialData();
}

// Seed demo user and default watchlists if empty
function seedInitialData() {
  const userCount = db.get('SELECT COUNT(*) as count FROM users').count;
  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('demo1234', salt);

    const result = db.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      ['guest@pulse.market', hash, 'Pulse Demo Trader']
    );
    const guestId = result.lastInsertRowid;

    // Create session from 3 hours ago to simulate returning user
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    db.run('INSERT INTO user_sessions (user_id, last_seen_at) VALUES (?, ?)', [guestId, threeHoursAgo]);

    // Create Watchlist 1: Tech & AI Leaders
    const wl1 = db.run(
      'INSERT INTO watchlists (user_id, name, description) VALUES (?, ?, ?)',
      [guestId, 'AI & Tech Titans', 'Top market bellwethers driving the AI infrastructure wave']
    );
    const wl1Id = wl1.lastInsertRowid;

    const wl1Tickers = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
    for (const t of wl1Tickers) {
      db.run('INSERT INTO watchlist_items (watchlist_id, ticker) VALUES (?, ?)', [wl1Id, t]);
    }

    // Create Watchlist 2: Momentum & Crypto Proxies
    const wl2 = db.run(
      'INSERT INTO watchlists (user_id, name, description) VALUES (?, ?, ?)',
      [guestId, 'High-Beta Momentum', 'Fast-moving breakout candidates and high volatility plays']
    );
    const wl2Id = wl2.lastInsertRowid;

    const wl2Tickers = ['PLTR', 'COIN', 'AMD', 'ARM', 'SMCI'];
    for (const t of wl2Tickers) {
      db.run('INSERT INTO watchlist_items (watchlist_id, ticker) VALUES (?, ?)', [wl2Id, t]);
    }

    // Create Watchlist 3: Indian Nifty 50 Giants (Homage to Groww)
    const wl3 = db.run(
      'INSERT INTO watchlists (user_id, name, description) VALUES (?, ?, ?)',
      [guestId, '🇮🇳 Nifty 50 Titans (Groww NSE)', 'Leading bluechips of the Indian market across Energy, Banking, Tech & Auto']
    );
    const wl3Id = wl3.lastInsertRowid;

    const wl3Tickers = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'ICICIBANK', 'ZOMATO', 'ITC'];
    for (const t of wl3Tickers) {
      db.run('INSERT INTO watchlist_items (watchlist_id, ticker) VALUES (?, ?)', [wl3Id, t]);
    }

    console.log('✅ Database seeded with default guest trader and watchlists.');
  } else {
    // If guest user exists, ensure Nifty 50 watchlist is present
    const guestUser = db.get('SELECT id FROM users WHERE email = ?', ['guest@pulse.market']);
    if (guestUser) {
      const existingNifty = db.get('SELECT id FROM watchlists WHERE user_id = ? AND name LIKE ?', [guestUser.id, '%Nifty%']);
      if (!existingNifty) {
        const wl3 = db.run(
          'INSERT INTO watchlists (user_id, name, description) VALUES (?, ?, ?)',
          [guestUser.id, '🇮🇳 Nifty 50 Titans (Groww NSE)', 'Leading bluechips of the Indian market across Energy, Banking, Tech & Auto']
        );
        const wl3Id = wl3.lastInsertRowid;
        const wl3Tickers = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'ICICIBANK', 'ZOMATO', 'ITC'];
        for (const t of wl3Tickers) {
          db.run('INSERT OR IGNORE INTO watchlist_items (watchlist_id, ticker) VALUES (?, ?)', [wl3Id, t]);
        }
      }
    }
  }
}

initDatabase();

module.exports = db;
