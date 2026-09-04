const http = require('http');
const app = require('./server');

const server = http.createServer(app);
const PORT = 5099;

server.listen(PORT, async () => {
  console.log(`📡 Test server running on port ${PORT}...`);

  try {
    // 1. Health check
    const health = await fetchJson(`http://localhost:${PORT}/api/health`);
    console.log('✅ Health Check Status:', health.status);

    // 2. Guest login
    const guestRes = await fetchJson(`http://localhost:${PORT}/api/auth/guest`, { method: 'POST' });
    const token = guestRes.token;
    console.log(`✅ Guest Auth Succeeded: Logged in as ${guestRes.user.name} (${guestRes.user.email})`);

    // 3. Fetch watchlists
    const wlRes = await fetchJson(`http://localhost:${PORT}/api/watchlists`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Fetched ${wlRes.watchlists.length} watchlists:`, wlRes.watchlists.map(w => `${w.name} (${w.itemsCount} items)`).join(', '));
    const activeWlId = wlRes.watchlists[0].id;

    // 4. Fetch triage feed
    const feedRes = await fetchJson(`http://localhost:${PORT}/api/watchlists/${activeWlId}/feed`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Watchlist Feed Generated: ${feedRes.needsAttention.length} Flagged, ${feedRes.quiet.length} Quiet`);
    console.log(`   Top Attention Stock: [${feedRes.needsAttention[0].ticker}] Score: ${feedRes.needsAttention[0].attentionScore}`);
    console.log(`   Narrative: "${feedRes.needsAttention[0].narrative}"`);

    // 5. Fetch Correlation Matrix
    const corrRes = await fetchJson(`http://localhost:${PORT}/api/watchlists/${activeWlId}/correlation`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Correlation Matrix computed for ${corrRes.tickers.length} assets`);

    // 6. Fetch Health Score
    const healthRes = await fetchJson(`http://localhost:${PORT}/api/watchlists/${activeWlId}/health`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Watchlist Health Index: ${healthRes.health.score}/100 (${healthRes.health.riskLevel})`);

    // 7. Fetch Timeline Scrubber
    const timelineRes = await fetchJson(`http://localhost:${PORT}/api/watchlists/${activeWlId}/timeline`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Timeline Scrubber Slices: ${timelineRes.slices.length} intervals generated`);

    // 8. Simulate Market Shock
    const shockRes = await fetchJson(`http://localhost:${PORT}/api/market/simulate-shock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: 'NVDA', shockPct: 6.2, volumeBoost: 3.5 })
    });
    console.log(`✅ Market Shock Triggered: ${shockRes.message}`);

    console.log('\n🎉 ALL 8 FULL-STACK END-TO-END VERIFICATION CHECKS PASSED!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
});

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}
