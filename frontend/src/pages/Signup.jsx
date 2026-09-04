import React, { useState } from 'react';
import { Activity, ArrowRight, Zap } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AmbientBackground from '../components/layout/AmbientBackground';
import { useAuthStore } from '../store/authStore';

export default function Signup({ onNavigateLogin, onNavigateLanding }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, guestLogin } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password, name);
    } catch (err) {
      setError(err.message || 'Signup failed');
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
            Create Your Account
          </h2>
          <p className="text-xs text-slate-400">
            Get your own personalized market triage feed in seconds
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Name or Handle"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            Create Watchlist Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-teal-400 font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
