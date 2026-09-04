import React, { useState } from 'react';
import { Activity, ArrowRight, Zap } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AmbientBackground from '../components/layout/AmbientBackground';
import { useAuthStore } from '../store/authStore';

export default function Login({ onNavigateSignup, onNavigateLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, guestLogin } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await guestLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0A0E17]">
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div 
            onClick={onNavigateLanding}
            className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-violet-600 items-center justify-center shadow-[0_0_25px_rgba(20,184,166,0.35)] cursor-pointer"
          >
            <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            Welcome to Pulse
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to check what meaningfully moved in your watchlists
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="trader@pulse.market"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button variant="primary" type="submit" className="w-full" isLoading={loading}>
            Sign In to Watchlist
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-[#0A0E17] px-2 text-slate-500">Or For Hackathon Judges</span>
          </div>
        </div>

        <Button variant="secondary" onClick={handleGuest} className="w-full" isLoading={loading}>
          <Zap className="w-3.5 h-3.5 text-teal-400" />
          1-Click Instant Guest Demo Session
        </Button>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onNavigateSignup}
            className="text-teal-400 font-semibold hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
