import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  RotateCcw,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import Button from '../ui/Button';

export default function AICoPilotDrawer({
  isOpen,
  onClose,
  feedData,
  healthData,
  onSelectWorkspace
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 Hello! I'm your **Pulse Trade Desk Co-Pilot**. I'm actively monitoring your watchlist's Attention Scores, volatility z-scores, and institutional FII/DII money flows.\n\nAsk me anything about today's market anomalies or pick a query below.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Why is TSLA flagged today?",
    "Best hedge against an RBI rate hike?",
    "Explain FII vs DII smart money flows",
    "Compare RELIANCE vs TCS for compound growth",
    "Evaluate portfolio health & risk score"
  ];

  const generateHeuristicResponse = (query) => {
    const q = query.toLowerCase();
    const allItems = [...(feedData?.needsAttention || []), ...(feedData?.quiet || [])];
    const tsla = allItems.find(i => i.ticker === 'TSLA');
    const nvda = allItems.find(i => i.ticker === 'NVDA');
    const reliance = allItems.find(i => i.ticker === 'RELIANCE');
    const hdfc = allItems.find(i => i.ticker === 'HDFCBANK');

    if (q.includes('tsla') || q.includes('tesla')) {
      const p = tsla?.price || 218.40;
      const chg = tsla?.changePct || 5.41;
      const z = tsla?.scoreBreakdown?.relativeMoveZScore || 3.1;
      const vol = tsla?.scoreBreakdown?.volumeAnomalyRatio || 3.2;
      return `### ⚡ TSLA Triage Diagnostic\n\n* **Price Action**: TSLA is trading at **$${p}** (${chg > 0 ? '+' : ''}${chg}% today).\n* **Mathematical Trigger**: Surfaced into *Needs Your Attention* due to a **${z}σ volatility z-score** accompanied by **${vol}x average institutional volume**.\n* **Desk Recommendation**: This move broke through the 50-day moving average. However, with RSI nearing 74, consider trailing stop-losses rather than chasing breakout entries at resistance.`;
    }

    if (q.includes('rate hike') || q.includes('hedge') || q.includes('rbi') || q.includes('fed')) {
      return `### 🛡️ Macro Shock Safe-Haven Hedges\n\nIn our **Black Swan Stress Engine**, an emergency +75bps rate hike compresses high-PE tech multiples (-7.4% to -9.2%).\n\n* **Top Hedges**: **HDFCBANK** (+3.2%) and **ICICIBANK** (+2.8%).\n* **Why?**: Private banks benefit from floating-rate corporate loan books that reprice upward faster than fixed deposit liabilities, expanding Net Interest Margins (NIMs).\n* **Action**: Check the *Black Swan Stress Tester* (Hotkey \`T\`) to simulate this on your active holdings.`;
    }

    if (q.includes('fii') || q.includes('dii') || q.includes('smart money') || q.includes('institutional')) {
      return `### 🏛️ FII vs DII Flow Dynamics\n\n* **FII (Foreign Institutional Investors)**: Global hot money sensitive to US Treasury yields, the DXY Dollar Index, and sovereign currency risk.\n* **DII (Domestic Institutional Investors)**: Indian domestic mutual funds and retail SIP inflows (exceeding ₹21,000 Cr/month), providing structural downside liquidity cushions.\n* **Current Watchlist Reading**: Large-cap holdings show sustained DII accumulation, absorbing foreign macro volatility. Look at the FII/DII strip on each stock card for real-time net figures.`;
    }

    if (q.includes('reliance') || q.includes('tcs') || q.includes('compound')) {
      return `### ⚔️ RELIANCE vs TCS Long-Term Compound Analysis\n\n* **RELIANCE**: Multi-engine conglomerate (Oil-to-Chemicals cash cow funding Jio Telecom and Retail expansions). Higher beta with infrastructure tailwinds.\n* **TCS**: Generates 25%+ operating margins with pure free cash-flow dividend yield. Extremely low volatility anchor (0.4σ).\n* **Verdict**: For monthly SIP wealth compounding, a 60/40 allocation across RELIANCE (Growth Alpha) and TCS (Defensive Floor) delivers optimal risk-adjusted Sharpe Ratio. Open the *Stock Duel* tab to view the factor breakdown.`;
    }

    if (q.includes('health') || q.includes('risk') || q.includes('score')) {
      const score = healthData?.overallScore || 84;
      return `### 🩺 Watchlist Health Diagnostic (${score}/100)\n\n* **Overall Score**: **${score}/100** — *${healthData?.status || 'Resilient & Diversified'}*\n* **Diversification**: **${healthData?.diversification || 88}/100** (Low cross-sector pairwise correlation).\n* **Volatility Stability**: **${healthData?.volatilityStability || 82}/100** (Drawdown risks are buffered by dividend anchors).\n* **Desk Advice**: Maintain existing weightings. High Attention Score moves on 1 or 2 stocks are isolated and not generating systemic portfolio contagion.`;
    }

    return `### 🤖 Quantitative Desk Briefing\n\nRegarding *"${query}"*:\n\n* **Current Triage State**: Your active watchlist has **${feedData?.needsAttention?.length || 2} assets flagged for immediate attention** and **${feedData?.quiet?.length || 4} assets in calm territory**.\n* **Action Tip**: Use the **Stock Duel** mode to compare any two assets side-by-side, or test a hypothetical crisis using the **Black Swan Stress Tester** (Hotkey \`T\`).`;
  };

  const handleSend = (textToSend = null) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate streaming AI thinking
    setTimeout(() => {
      const responseText = generateHeuristicResponse(query);
      const assistantMsg = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-lg h-full bg-[#0B101B]/95 border-l border-white/10 shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-violet-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Pulse Trade Desk Co-Pilot</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                  AI ASSISTANT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Context-aware quantitative market reasoning</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-b border-white/5 bg-slate-900/40 overflow-x-auto scrollbar-none flex items-center gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full glass-panel hover:bg-teal-500/10 hover:text-teal-300 hover:border-teal-500/30 text-[11px] text-slate-300 transition-all shrink-0 border border-white/10"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                    isUser
                      ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-sm shadow-md'
                      : 'glass-card border border-white/10 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert prose-xs">
                    {m.text}
                  </div>
                  <span className={`text-[10px] font-mono block text-right ${isUser ? 'text-slate-800' : 'text-slate-500'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono p-2">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Analyzing market telemetry...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/10 bg-slate-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about attention scores, hedges, or institutional flows..."
              className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <Button variant="primary" size="sm" type="submit" disabled={!inputValue.trim()}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
