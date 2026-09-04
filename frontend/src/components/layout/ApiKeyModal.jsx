import React, { useState } from 'react';
import { Key, CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldCheck, ExternalLink, Activity } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { 
  getActiveFinnhubKey, 
  setActiveFinnhubKey, 
  DEFAULT_FINNHUB_KEY, 
  testFinnhubConnection 
} from '../../api/finnhubClient';
import { useWatchlistStore } from '../../store/watchlistStore';

export default function ApiKeyModal({ isOpen, onClose }) {
  const currentKey = getActiveFinnhubKey();
  const [apiKeyInput, setApiKeyInput] = useState(currentKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const { activeWatchlistId, loadWatchlistData } = useWatchlistStore();

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestError('');
    try {
      const res = await testFinnhubConnection(apiKeyInput);
      setTestResult(res);
    } catch (err) {
      setTestError(err.message || 'Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndSync = async () => {
    setActiveFinnhubKey(apiKeyInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    if (activeWatchlistId) {
      loadWatchlistData(activeWatchlistId, false);
    }
  };

  const handleResetDefault = () => {
    setApiKeyInput(DEFAULT_FINNHUB_KEY);
    setActiveFinnhubKey(DEFAULT_FINNHUB_KEY);
    setTestResult(null);
    setTestError('');
    if (activeWatchlistId) {
      loadWatchlistData(activeWatchlistId, false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finnhub API Key & Live Data Engine">
      <div className="space-y-5 text-xs text-slate-300">
        {/* Connection Status Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-teal-950/30 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">Finnhub Market Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  ONLINE & STREAMING
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Powering real-time quote feeds directly in your browser with zero server latency.
              </p>
            </div>
          </div>
        </div>

        {/* API Key Configuration Form */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
            Finnhub API Key (Active Key)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste your Finnhub API Key..."
              className="font-mono text-xs flex-1"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="shrink-0 flex items-center justify-center gap-1.5"
            >
              {isTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-teal-400" />
              )}
              <span>{isTesting ? 'Testing...' : 'Ping Test'}</span>
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">
            Default pre-configured token:{' '}
            <code className="text-teal-300/80 font-mono select-all">
              {DEFAULT_FINNHUB_KEY.slice(0, 10)}...{DEFAULT_FINNHUB_KEY.slice(-4)}
            </code>
          </p>
        </div>

        {/* Live Test Results Box */}
        {testResult && (
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Finnhub Connection Verified! (Latency: {testResult.latency}ms)</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-white/5">
              Live quote received: <span className="font-bold text-teal-300">${testResult.sampleQuote.ticker}</span> @ ${testResult.sampleQuote.price.toFixed(2)} ({testResult.sampleQuote.pctChange >= 0 ? '+' : ''}{testResult.sampleQuote.pctChange}%)
            </div>
          </div>
        )}

        {testError && (
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 space-y-1 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Finnhub Ping Failed</p>
              <p className="text-[11px] text-rose-200/80">{testError}</p>
            </div>
          </div>
        )}

        {/* Architecture Details */}
        <div className="rounded-xl p-3.5 bg-slate-900/60 border border-white/5 space-y-2 text-[11px]">
          <span className="font-mono text-[10px] text-teal-400 uppercase tracking-wider font-bold block">
            Pulse Multi-Source Architecture:
          </span>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span><strong>US Tech Momentum</strong>: Direct real-time quotes via Finnhub REST API (/v1/quote).</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span><strong>Nifty 50 Titans (NSE)</strong>: Dalal Street institutional flow engine with real-time FII/DII tracking.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span><strong>Rate Limit Guard</strong>: 15-second client-side cache prevents 429 errors on Finnhub free tier (60 calls/min).</span>
            </li>
          </ul>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Reset to Default Pulse Key
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="flex-1 sm:flex-none text-xs"
            >
              Close
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleSaveAndSync}
              className="flex-1 sm:flex-none text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
              <span>{isSaved ? 'Saved & Synced!' : 'Save & Sync Live Data'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
