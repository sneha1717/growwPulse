import { 
  generateMockFeed, 
  generateMockHealth, 
  generateMockTimeline, 
  generateMockHistory, 
  MOCK_WATCHLISTS 
} from './mockFallback';

const API_BASE = '/api';

function handleMockFallback(endpoint, options = {}) {
  console.info(`[Pulse API] Serving client fallback for ${endpoint}`);
  
  if (endpoint.startsWith('/auth/guest') || endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/signup')) {
    return { token: 'demo-jwt-token', user: { id: 1, name: 'Elite Trader', email: 'trader@groww.in' } };
  }
  if (endpoint.startsWith('/auth/me')) {
    return { user: { id: 1, name: 'Elite Trader', email: 'trader@groww.in' } };
  }
  if (endpoint === '/watchlists') {
    return { watchlists: MOCK_WATCHLISTS };
  }
  if (endpoint.includes('/feed')) {
    const parts = endpoint.split('/');
    const wlId = parts[2] ? parseInt(parts[2], 10) || 1 : 1;
    return generateMockFeed(wlId);
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
    return {
      labels: ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL'],
      matrix: [
        [1.0, 0.72, 0.45, 0.58, 0.61, 0.52],
        [0.72, 1.0, 0.38, 0.49, 0.55, 0.44],
        [0.45, 0.38, 1.0, 0.65, 0.62, 0.58],
        [0.58, 0.49, 0.65, 1.0, 0.74, 0.71],
        [0.61, 0.55, 0.62, 0.74, 1.0, 0.69],
        [0.52, 0.44, 0.58, 0.71, 0.69, 1.0]
      ]
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
