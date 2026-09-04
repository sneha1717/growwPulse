import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Share2, Copy, Check, Sparkles, Activity } from 'lucide-react';
import { useWatchlistStore } from '../../store/watchlistStore';

export default function ShareSnapshotModal() {
  const { isShareModalOpen, setShareModalOpen, feedData, healthData, watchlists, activeWatchlistId } = useWatchlistStore();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen || !feedData) return null;

  const currentWl = watchlists.find(w => w.id === activeWatchlistId) || { name: 'Watchlist' };
  const topItems = feedData.needsAttention || [];

  const shareText = `📊 Pulse Triage Feed — ${currentWl.name}
Health Score: ${healthData?.score || 75}/100 (${healthData?.riskLevel || 'Balanced'})

🔥 Top Attention Movers:
${topItems.map((item, i) => `${i + 1}. $${item.ticker} (${item.pctChangeDay >= 0 ? '+' : ''}${item.pctChangeDay}%): ${item.narrative}`).join('\n')}

Generated via Pulse (Smart Market Watchlist)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isShareModalOpen}
      onClose={() => setShareModalOpen(false)}
      title="Shareable Watchlist Snapshot"
    >
      <div className="space-y-4">
        {/* Renderable Preview Card */}
        <div className="gradient-border-teal-violet rounded-2xl p-5 space-y-3 bg-[#0A0E17]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-teal-400 font-bold block">
                PULSE // TRIAGE SNAPSHOT
              </span>
              <h4 className="text-base font-bold text-slate-100">{currentWl.name}</h4>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-teal-400">
                {healthData?.score || 75}
              </span>
              <span className="text-[10px] text-slate-400 block">Health Index</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Attention Priorities:</span>
            {topItems.slice(0, 3).map(item => (
              <div key={item.ticker} className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-100 mr-2">${item.ticker}</span>
                  <span className={item.pctChangeDay >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {item.pctChangeDay >= 0 ? '+' : ''}{item.pctChangeDay}%
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.narrative}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-bold">
                    Score {item.attentionScore}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] font-mono text-slate-500 text-center pt-1">
            Timestamp: {new Date().toLocaleString()} • Pulse Attention Engine
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setShareModalOpen(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Snapshot Text
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
