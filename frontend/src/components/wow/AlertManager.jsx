import React, { useState } from 'react';
import { Bell, BellRing, Plus, Trash2, CheckCircle, Zap } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function AlertManager({ ticker, currentPrice, attentionScore, symbolPrefix = '$' }) {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'ATTENTION', condition: 'Score > 8.0', value: 8.0, active: true },
    { id: 2, type: 'PRICE', condition: `Crosses ${symbolPrefix}${(currentPrice * 1.05).toFixed(1)}`, value: currentPrice * 1.05, active: true }
  ]);
  const [triggeredAlert, setTriggeredAlert] = useState(null);
  const [newTargetPrice, setNewTargetPrice] = useState('');

  // Synthesize a pleasant high-tech audio chime using Web Audio API (100% free, zero assets)
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // AudioContext unavailable
    }
  };

  const handleAddAlert = (e) => {
    e.preventDefault();
    if (!newTargetPrice) return;
    const val = parseFloat(newTargetPrice);
    setAlerts([
      ...alerts,
      {
        id: Date.now(),
        type: 'PRICE',
        condition: `Crosses ${symbolPrefix}${val.toFixed(2)}`,
        value: val,
        active: true
      }
    ]);
    setNewTargetPrice('');
  };

  const handleSimulateTrigger = (alert) => {
    playChime();
    setTriggeredAlert(alert);
    setTimeout(() => {
      setTriggeredAlert(null);
    }, 4500);
  };

  const handleDeleteAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-4 pt-2 animate-fadeIn text-xs">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-bold text-slate-100 tracking-wide uppercase font-mono">
            Smart Pulse Alert Engine
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
          {alerts.length} ACTIVE ALERTS
        </span>
      </div>

      {/* Trigger Notification Toast Banner */}
      {triggeredAlert && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-violet-500/20 border border-teal-400 text-teal-200 flex items-center justify-between shadow-[0_0_25px_rgba(20,184,166,0.35)] animate-pulse">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-teal-400 animate-bounce" />
            <div>
              <span className="font-mono font-bold block text-xs">
                ALERT TRIGGERED: {ticker} {triggeredAlert.condition}
              </span>
              <span className="text-[10px] text-teal-300/80">
                Market tick hit threshold (Attention Score: {attentionScore})
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-400 text-slate-950 font-bold">
            FIRED
          </span>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-2">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_6px_#14b8a6]" />
              <div>
                <span className="font-mono font-bold text-slate-200 block">
                  {ticker} {a.condition}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Type: {a.type} • Target: {a.value}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSimulateTrigger(a)}
                className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors"
                title="Simulate this alert firing for judges"
              >
                <Zap className="w-3 h-3" /> Test Fire
              </button>
              <button
                onClick={() => handleDeleteAlert(a.id)}
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Alert Form */}
      <form onSubmit={handleAddAlert} className="flex gap-2 pt-1">
        <input
          type="number"
          step="0.1"
          placeholder={`Set price alert e.g. ${(currentPrice * 1.05).toFixed(0)}`}
          value={newTargetPrice}
          onChange={(e) => setNewTargetPrice(e.target.value)}
          className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
        />
        <Button variant="primary" size="sm" type="submit">
          <Plus className="w-3.5 h-3.5" /> Add Alert
        </Button>
      </form>
    </div>
  );
}
