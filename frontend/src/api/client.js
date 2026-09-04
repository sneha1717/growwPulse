import { 
  generateMockFeed, 
  generateMockHealth, 
  generateMockTimeline, 
  generateMockHistory, 
  MOCK_WATCHLISTS 
} from './mockFallback';
import { fetchMultipleFinnhubQuotes } from './finnhubClient';

const API_BASE = '/api';

async function getLiveOrMockFeed(wlId = 1, weights = null) {
  const baseFeed = generateMockFeed(wlId, weights || undefined);
  if (wlId === 1 || wlId === '1') {
    try {
      const symbols = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL'];
      const liveQuotes = await fetchMultipleFinnhubQuotes(symbols);
      const hasLiveQuotes = Object.keys(liveQuotes).length > 0;

      if (hasLiveQuotes) {
        const updateItem = (item) => {
          const live = liveQuotes[item.ticker];
          if (!live) return item;
          const currentPrice = live.price;
          const change = live.change;
          const pctChange = live.pctChange;
          const zScore = parseFloat((Math.abs(pctChange) / 1.45).toFixed(2));
          const volumeRatio = parseFloat((Math.min(4.0, Math.max(0.8, 1.0 + Math.abs(pctChange) * 0.35))).toFixed(1));
          const c = zScore > 2.2 ? 1 : 0;
          const t = 0.6;
          const w = weights || { w1: 2.5, w2: 1.8, w3: 2.2, w4: 0.8 };
          const attentionScore = parseFloat((w.w1 * zScore + w.w2 * volumeRatio + w.w3 * c + w.w4 * t).toFixed(2));

          return {
            ...item,
            price: currentPrice,
            change,
            changePct: pctChange,
            pctChangeDay: pctChange,
            priceDeltaDay: change,
            attentionScore,
            high52: Math.max(item.high52 || currentPrice * 1.15, live.high),
            low52: Math.min(item.low52 || currentPrice * 0.85, live.low),
            summarySentence: `${item.ticker} is trading at $${currentPrice.toFixed(2)} (${pctChange >= 0 ? '+' : ''}${pctChange}%) with live Finnhub execution.`,
            narrative: `${item.ticker} is trading at $${currentPrice.toFixed(2)} (${pctChange >= 0 ? '+' : ''}${pctChange}%) with live Finnhub execution.`,
            diffSinceLastSeen: {
              priceDelta: change,
              pctDelta: pctChange,
              summary: `Moved ${pctChange >= 0 ? '+' : ''}${pctChange}% in active trading`
            },
            scoreBreakdown: {
              relativeMoveZScore: zScore,
              volumeAnomalyRatio: volumeRatio,
              levelCrossings: c ? ['50-Day MA'] : [],
              timeDecayBoost: t
            }
          };
        };

        const allItems = [...baseFeed.needsAttention, ...baseFeed.quiet].map(updateItem);
        allItems.sort((a, b) => b.attentionScore - a.attentionScore);
        allItems.forEach((it, idx) => { it.priorityRank = idx + 1; });

        const needsAttention = allItems.slice(0, 2);
        const quiet = allItems.slice(2);

        return {
          ...baseFeed,
          lastSuccessfulFetchAt: new Date().toISOString(),
          lastSuccessfulFetchFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          finnhub: {
            fetchStatus: 'LIVE_FINNHUB',
            feedSourceLabel: 'Finnhub Live Quote Engine (REST)'
          },
          needsAttention,
          quiet
        };
      }
    } catch (err) {
      console.warn('[Finnhub] Falling back to baseline simulation:', err);
    }
  }
  return baseFeed;
}

async function handleMockFallback(endpoint, options = {}) {
  console.info(`[Pulse API] Serving client fallback for ${endpoint}`);
  
  if (endpoint.startsWith('/auth/guest') || endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/signup')) {
    return { token: 'demo-jwt-token', user: { id: 1, name: 'Guest Trader', email: 'guest@groww.in' } };
  }
  if (endpoint.startsWith('/auth/me')) {
    return { user: { id: 1, name: 'Guest Trader', email: 'guest@groww.in' } };
  }
  if (endpoint === '/watchlists') {
    return { watchlists: MOCK_WATCHLISTS };
  }
  if (endpoint.includes('/feed')) {
    const parts = endpoint.split('/');
    const wlId = parts[2] ? parseInt(parts[2], 10) || 1 : 1;
    let weights = null;
    if (options.body) {
      try {
        const parsed = JSON.parse(options.body);
        weights = parsed.weights;
      } catch (e) {}
    }
    return await getLiveOrMockFeed(wlId, weights);
  }
  if (endpoint.includes('/health')) {
    const parts = endpoint.split('/');
    const wlId = parts[2] ? parseInt(parts[2], 10) || 1 : 1;
    return generateMockHealth(wlId);
  }
  if (endpoint.includes('/timeline')) {
    const parts = endpoint.split('/');
    const wlId = parts[2] ? parseInt(parts[2], 10) || 1 : 1;
    return generateMockTimeline(wlId);
  }
  if (endpoint.includes('/correlation')) {
    const parts = endpoint.split('/');
    const wlId = parts[2] ? parseInt(parts[2], 10) || 1 : 1;
    
    let tickers = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL'];
    if (wlId === 2) {
      tickers = ['TSLA', 'NVDA', 'COIN', 'AMD', 'PLTR', 'META'];
    } else if (wlId === 3) {
      tickers = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'ZOMATO'];
    }

    const baseMatrices = {
      1: [
        [1.0, 0.72, 0.45, 0.58, 0.61, 0.52],
        [0.72, 1.0, 0.38, 0.49, 0.55, 0.44],
        [0.45, 0.38, 1.0, 0.65, 0.62, 0.58],
        [0.58, 0.49, 0.65, 1.0, 0.74, 0.71],
        [0.61, 0.55, 0.62, 0.74, 1.0, 0.69],
        [0.52, 0.44, 0.58, 0.71, 0.69, 1.0]
      ],
      2: [
        [1.0, 0.81, 0.65, 0.76, 0.72, 0.64],
        [0.81, 1.0, 0.59, 0.84, 0.77, 0.68],
        [0.65, 0.59, 1.0, 0.55, 0.61, 0.48],
        [0.76, 0.84, 0.55, 1.0, 0.73, 0.66],
        [0.72, 0.77, 0.61, 0.73, 1.0, 0.62],
        [0.64, 0.68, 0.48, 0.66, 0.62, 1.0]
      ],
      3: [
        [1.0, 0.32, 0.58, 0.28, 0.54, 0.18],
        [0.32, 1.0, 0.25, 0.82, 0.29, 0.35],
        [0.58, 0.25, 1.0, 0.22, 0.86, 0.12],
        [0.28, 0.82, 0.22, 1.0, 0.24, 0.38],
        [0.54, 0.29, 0.86, 0.24, 1.0, 0.15],
        [0.18, 0.35, 0.12, 0.38, 0.15, 1.0]
      ]
    };

    const raw = baseMatrices[wlId] || baseMatrices[1];
    const matrixObj = {};
    const pairs = [];

    tickers.forEach((t1, i) => {
      matrixObj[t1] = {};
      tickers.forEach((t2, j) => {
        const val = raw[i]?.[j] !== undefined ? raw[i][j] : (i === j ? 1.0 : 0.5);
        matrixObj[t1][t2] = val;
        if (i < j) {
          pairs.push({ tickerA: t1, tickerB: t2, correlation: val });
        }
      });
    });

    return {
      watchlist: { id: wlId },
      tickers,
      labels: tickers,
      matrix: matrixObj,
      rawMatrix: raw,
      pairs
    };
  }
  if (endpoint.includes('/history')) {
    const match = endpoint.match(/\/tickers\/([^/]+)\/history/);
    const ticker = match ? match[1] : 'NVDA';
    return generateMockHistory(ticker);
  }
  if (endpoint.includes('/search')) {
    return {
      results: [
        { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors' },
        { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive & Clean Energy' },
        { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Consumer Electronics' },
        { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy & Tech' },
        { ticker: 'TCS', name: 'Tata Consultancy Services', sector: 'IT Services' },
        { ticker: 'ZOMATO', name: 'Zomato Limited', sector: 'Quick Commerce & Tech' }
      ]
    };
  }
  return { success: true };
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('pulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Returned HTML or error page (e.g. static Vercel missing backend route)
      return handleMockFallback(endpoint, options);
    }
    const data = await response.json();
    if (!response.ok) {
      return handleMockFallback(endpoint, options);
    }
    return data;
  } catch (err) {
    // Network error or backend offline
    return handleMockFallback(endpoint, options);
  }
}

export const api = {
  // Auth
  signup: (email, password, name) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  guestLogin: () =>
    request('/auth/guest', { method: 'POST' }),
  getMe: () =>
    request('/auth/me'),

  // Watchlists
  getWatchlists: () =>
    request('/watchlists'),
  createWatchlist: (name, description, initialTickers = []) =>
    request('/watchlists', { method: 'POST', body: JSON.stringify({ name, description, initialTickers }) }),
  getWatchlist: (id) =>
    request(`/watchlists/${id}`),
  deleteWatchlist: (id) =>
    request(`/watchlists/${id}`, { method: 'DELETE' }),
  addTicker: (watchlistId, ticker) =>
    request(`/watchlists/${watchlistId}/items`, { method: 'POST', body: JSON.stringify({ ticker }) }),
  removeTicker: (watchlistId, ticker) =>
    request(`/watchlists/${watchlistId}/items/${ticker}`, { method: 'DELETE' }),
  searchTickers: (query) =>
    request(`/watchlists/search?q=${encodeURIComponent(query)}`),

  // Feed (Core Differentiator with optional weight tuning)
  getFeed: (watchlistId, weights = null) => {
    let url = `/watchlists/${watchlistId}/feed`;
    if (weights) {
      url += `?w1=${weights.w1}&w2=${weights.w2}&w3=${weights.w3}&w4=${weights.w4}`;
    }
    return request(url);
  },

  // Analytics (Wow Features)
  getCorrelation: (watchlistId) =>
    request(`/watchlists/${watchlistId}/correlation`),
  getHealth: (watchlistId) =>
    request(`/watchlists/${watchlistId}/health`),
  getTimeline: (watchlistId) =>
    request(`/watchlists/${watchlistId}/timeline`),

  // Tickers & Shock simulation
  getHistory: (ticker, days = 30) =>
    request(`/tickers/${ticker}/history?days=${days}`),
  simulateShock: (ticker, shockPct = 5.4, volumeBoost = 2.8) =>
    request('/market/simulate-shock', { method: 'POST', body: JSON.stringify({ ticker, shockPct, volumeBoost }) })
};
