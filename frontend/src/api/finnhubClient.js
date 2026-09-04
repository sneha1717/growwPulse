/**
 * Production Finnhub Market Data Integration for Pulse (Client-Side)
 * Allows direct browser calls on Vercel without requiring a Node backend proxy.
 */

export const DEFAULT_FINNHUB_KEY = 'dadfbepr01qtj63p4td0dadfbepr01qtj63p4tdg';

export function getActiveFinnhubKey() {
  if (typeof window === 'undefined') return DEFAULT_FINNHUB_KEY;
  const custom = localStorage.getItem('pulse_finnhub_key');
  if (custom && custom.trim().length > 5) return custom.trim();
  const envKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (envKey && envKey.trim().length > 5) return envKey.trim();
  return DEFAULT_FINNHUB_KEY;
}

export function setActiveFinnhubKey(key) {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem('pulse_finnhub_key', key.trim());
  } else {
    localStorage.removeItem('pulse_finnhub_key');
  }
}

// In-memory quote cache with 15-second TTL to respect Finnhub free tier limits (60 req/min)
const quoteCache = new Map();
const CACHE_TTL_MS = 15000;

export async function fetchLiveFinnhubQuote(symbol) {
  const cleanSymbol = symbol.toUpperCase().trim();
  const cached = quoteCache.get(cleanSymbol);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const key = getActiveFinnhubKey();
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(cleanSymbol)}&token=${encodeURIComponent(key)}`;

  const startTime = Date.now();
  const res = await fetch(url);
  const latency = Date.now() - startTime;

  if (res.status === 429) {
    if (cached) return cached.data;
    throw new Error('Finnhub rate limit reached (60 req/min). Serving cached data.');
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error('Invalid Finnhub API key. Please check key in settings.');
  }
  if (!res.ok) {
    if (cached) return cached.data;
    throw new Error(`Finnhub returned HTTP ${res.status}`);
  }

  const data = await res.json();
  // Finnhub returns { c: current, d: change, dp: pct_change, h: high, l: low, o: open, pc: prev_close, t: timestamp }
  if (typeof data.c !== 'number' || data.c <= 0) {
    if (cached) return cached.data;
    throw new Error('Invalid quote payload from Finnhub');
  }

  const quote = {
    ticker: cleanSymbol,
    price: parseFloat(data.c.toFixed(2)),
    change: parseFloat((data.d || 0).toFixed(2)),
    pctChange: parseFloat((data.dp || 0).toFixed(2)),
    high: parseFloat((data.h || data.c * 1.02).toFixed(2)),
    low: parseFloat((data.l || data.c * 0.98).toFixed(2)),
    open: parseFloat((data.o || data.c).toFixed(2)),
    prevClose: parseFloat((data.pc || data.c).toFixed(2)),
    timestamp: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
    latency
  };

  quoteCache.set(cleanSymbol, { data: quote, timestamp: Date.now() });
  return quote;
}

export async function fetchMultipleFinnhubQuotes(symbols = []) {
  const results = {};
  const promises = symbols.map(async (sym) => {
    try {
      const q = await fetchLiveFinnhubQuote(sym);
      results[sym] = q;
    } catch (err) {
      console.warn(`[Finnhub Client] Failed to fetch quote for ${sym}:`, err.message);
    }
  });

  await Promise.all(promises);
  return results;
}

export async function testFinnhubConnection(keyToTest) {
  const key = (keyToTest || getActiveFinnhubKey()).trim();
  const url = `https://finnhub.io/api/v1/quote?symbol=NVDA&token=${encodeURIComponent(key)}`;
  const start = Date.now();
  const res = await fetch(url);
  const latency = Date.now() - start;

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('Unauthorized: Invalid Finnhub API key');
    if (res.status === 429) throw new Error('Rate limited by Finnhub. Please wait a minute.');
    throw new Error(`Finnhub returned status ${res.status}`);
  }

  const data = await res.json();
  if (typeof data.c !== 'number' || data.c <= 0) {
    throw new Error('Received invalid response from Finnhub');
  }

  return {
    success: true,
    latency,
    sampleQuote: {
      ticker: 'NVDA',
      price: data.c,
      change: data.d,
      pctChange: data.dp
    }
  };
}
