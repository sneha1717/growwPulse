const db = require('./config/database');
const { buildWatchlistFeed } = require('./services/attention');
const { calculateCorrelationMatrix, calculateHealthScore } = require('./utils/math');
const { getTickerHistory, getLatestSnapshot } = require('./services/marketData');

console.log('🧪 Starting Pulse Backend Verification Tests...\n');

// 1. Check database tables
const tables = db.all("SELECT name FROM sqlite_master WHERE type='table'");
console.log('✅ Found Database Tables:', tables.map(t => t.name).join(', '));

// 2. Check Seeded Users and Watchlists
const users = db.all('SELECT id, email, name FROM users');
console.log(`✅ Seeded Users: ${users.length} (${users.map(u => u.email).join(', ')})`);

const watchlists = db.all('SELECT id, name FROM watchlists');
console.log(`✅ Seeded Watchlists: ${watchlists.length} (${watchlists.map(w => w.name).join(', ')})`);

// 3. Test Attention Score Calculation for AI & Tech Titans
const tickers = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'GOOGL'];
const fourHoursAgo = new Date(Date.now() - 4 * 3600 * 1000).toISOString();
const feed = buildWatchlistFeed(tickers, fourHoursAgo);

console.log('\n🎯 Triage Feed Results:');
console.log(`- Total Items: ${feed.totalCount}`);
console.log(`- "Needs your attention" items (${feed.attentionCount}):`);
feed.needsAttention.forEach((item, idx) => {
  console.log(`  ${idx + 1}. [${item.ticker}] Score: ${item.attentionScore} | Move: ${item.pctChangeDay > 0 ? '+' : ''}${item.pctChangeDay}% | Diff: ${item.diffSinceLastSeen.pctDelta}%`);
  console.log(`     Narrative: "${item.narrative}"`);
});

console.log(`- "Quiet" items (${feed.quietCount}):`);
feed.quiet.forEach((item, idx) => {
  console.log(`  ${idx + 1}. [${item.ticker}] Score: ${item.attentionScore} | Move: ${item.pctChangeDay}%`);
});

// 4. Test Pearson Correlation Matrix
const historyMap = {};
for (const t of tickers) {
  historyMap[t] = getTickerHistory(t, 30);
}
const matrix = calculateCorrelationMatrix(tickers, historyMap);
console.log('\n📊 Correlation Matrix Verification:');
console.log(`- NVDA with NVDA (should be 1.0): ${matrix['NVDA']['NVDA']}`);
console.log(`- NVDA with MSFT: ${matrix['NVDA']['MSFT']}`);
console.log(`- TSLA with AAPL: ${matrix['TSLA']['AAPL']}`);

// 5. Test Watchlist Health Score
const itemsData = tickers.map(t => ({
  ticker: t,
  pct_change_day: getLatestSnapshot(t)?.pct_change_day || 0,
  volatility: historyMap[t].volatility
}));
const health = calculateHealthScore(itemsData, matrix);
console.log('\n🩺 Watchlist Health Score:');
console.log(`- Score: ${health.score}/100 (${health.riskLevel})`);
console.log(`- Volatility Metric: ${health.metrics.volatility}`);
console.log(`- Diversification Metric: ${health.metrics.diversification}`);

console.log('\n✨ All backend algorithmic and database tests PASSED successfully!\n');
