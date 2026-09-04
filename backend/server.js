require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { startPollingWorker } = require('./services/polling');

// Route modules
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlists');
const feedRoutes = require('./routes/feed');
const analyticsRoutes = require('./routes/analytics');
const tickerRoutes = require('./routes/tickers');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging for dev
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/watchlists', feedRoutes);      // /api/watchlists/:id/feed
app.use('/api/watchlists', analyticsRoutes); // /api/watchlists/:id/correlation, /health, /timeline
app.use('/api/watchlists', watchlistRoutes);  // /api/watchlists (CRUD)
app.use('/api/tickers', tickerRoutes);
app.use('/api/market', tickerRoutes);        // /api/market/simulate-shock

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Pulse Market Watchlist API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start background polling worker (runs every 20s)
startPollingWorker(20000);

// Start server only if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Pulse Backend API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
