const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Signup
router.post('/signup', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const existing = db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const result = db.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, hash, name || email.split('@')[0]]
    );

    const userId = result.lastInsertRowid;
    const user = { id: userId, email, name: name || email.split('@')[0] };

    // Record initial session
    db.run('INSERT INTO user_sessions (user_id) VALUES (?)', [userId]);

    // Create a starter watchlist
    const wl = db.run(
      'INSERT INTO watchlists (user_id, name, description) VALUES (?, ?, ?)',
      [userId, 'My First Watchlist', 'Curated market leaders']
    );
    const wlId = wl.lastInsertRowid;

    for (const t of ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN']) {
      db.run('INSERT INTO watchlist_items (watchlist_id, ticker) VALUES (?, ?)', [wlId, t]);
    }

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Get previous last_seen_at before updating
    const lastSession = db.get(
      'SELECT last_seen_at FROM user_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [user.id]
    );

    // Record new session
    db.run('INSERT INTO user_sessions (user_id) VALUES (?)', [user.id]);

    const token = generateToken(user);
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      previousSessionAt: lastSession ? lastSession.last_seen_at : null,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// 1-Click Guest / Demo Session for Hackathon Judges
router.post('/guest', (req, res) => {
  try {
    let guestUser = db.get('SELECT * FROM users WHERE email = ?', ['guest@pulse.market']);
    if (!guestUser) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('demo1234', salt);
      const resUser = db.run(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        ['guest@pulse.market', hash, 'Pulse Demo Trader']
      );
      guestUser = { id: resUser.lastInsertRowid, email: 'guest@pulse.market', name: 'Pulse Demo Trader' };
    }

    // Simulate returning after 4 hours away to show the diff engine clearly
    const fourHoursAgo = new Date(Date.now() - 4 * 3600 * 1000).toISOString();
    db.run('INSERT INTO user_sessions (user_id, last_seen_at) VALUES (?, ?)', [guestUser.id, fourHoursAgo]);

    const token = generateToken(guestUser);
    res.json({
      user: { id: guestUser.id, email: guestUser.email, name: guestUser.name },
      previousSessionAt: fourHoursAgo,
      token,
      isDemo: true
    });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ error: 'Failed to initialize demo session.' });
  }
});

// Current User Profile
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const sessions = db.all(
      'SELECT last_seen_at FROM user_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 5',
      [user.id]
    );

    res.json({
      user,
      lastSeenAt: sessions.length > 1 ? sessions[1].last_seen_at : sessions[0]?.last_seen_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

module.exports = router;
