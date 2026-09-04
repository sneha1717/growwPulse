import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Square, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

export default function AudioBriefing({ watchlistName, healthScore, needsAttention = [], quietCount = 0 }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setHasSpeechSupport(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Construct the narrative script
  const generateScript = () => {
    const lines = [];
    lines.push(`Welcome to your Pulse Market Watchlist briefing for ${watchlistName}.`);
    
    if (healthScore) {
      lines.push(`Your overall watchlist health index is ${healthScore.score} out of 100, indicating a ${healthScore.riskLevel} risk profile.`);
    }

    if (needsAttention.length > 0) {
      lines.push(`We have triaged ${needsAttention.length} stocks requiring your immediate attention today.`);
      
      needsAttention.slice(0, 3).forEach((item, idx) => {
        const sign = item.pctChangeDay >= 0 ? 'up' : 'down';
        lines.push(`First, ${item.name}, ticker ${item.ticker}, is ${sign} ${Math.abs(item.pctChangeDay)} percent with an Attention Score of ${item.attentionScore}. ${item.narrative}`);
      });
    } else {
      lines.push(`All stocks in your watchlist are currently trading within normal volatility parameters.`);
    }

    if (quietCount > 0) {
      lines.push(`Your remaining ${quietCount} holdings remain quiet and within expected bounds.`);
    }

    lines.push(`That concludes your Pulse briefing.`);
    return lines.join(' ');
  };

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setCurrentCaption('');
      return;
    }

    synthRef.current.cancel();
    const script = generateScript();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentCaption(script);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentCaption('');
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentCaption('');
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  if (!hasSpeechSupport) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          onClick={handleTogglePlay}
          className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-lg ${
            isPlaying
              ? 'bg-gradient-to-r from-teal-500 to-violet-600 text-slate-950 border-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.35)] animate-pulse'
              : 'glass-panel hover:bg-slate-800 text-teal-300 border-teal-500/30 hover:border-teal-400/50'
          }`}
          title={isPlaying ? "Stop Audio Briefing" : "Play Voice Synthesized Podcast Briefing"}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current text-slate-950" />
              <span>Stop Briefing</span>
              {/* Dancing soundwave equalizer bars */}
              <span className="flex items-center gap-0.5 ml-1 h-3.5">
                <span className="w-1 bg-slate-950 rounded-full animate-bounce [animation-delay:0ms] h-full" />
                <span className="w-1 bg-slate-950 rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
                <span className="w-1 bg-slate-950 rounded-full animate-bounce [animation-delay:300ms] h-full" />
                <span className="w-1 bg-slate-950 rounded-full animate-bounce [animation-delay:450ms] h-3/4" />
              </span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-teal-400" />
              <span>Listen to Audio Digest</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-200">
                30s PODCAST
              </span>
            </>
          )}
        </button>
      </div>

      {/* Live Transcript Subtitles Banner */}
      {isPlaying && currentCaption && (
        <div className="glass-panel p-3 rounded-xl border border-teal-500/30 text-xs text-slate-200 flex items-start gap-2 animate-fadeIn bg-slate-950/70">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider block font-bold">
              AUDIO BRIEFING TRANSCRIPT
            </span>
            <p className="italic leading-relaxed text-slate-300 mt-0.5">
              "{currentCaption}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
