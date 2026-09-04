import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useWatchlistStore } from './store/watchlistStore';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();
  const { fetchWatchlists } = useWatchlistStore();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'landing', 'login', 'signup'

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlists();
    }
  }, [isAuthenticated, fetchWatchlists]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 antialiased selection:bg-teal-500/30 selection:text-teal-200">
      {isAuthenticated ? (
        <Dashboard />
      ) : currentView === 'login' ? (
        <Login
          onNavigateSignup={() => setCurrentView('signup')}
          onNavigateLanding={() => setCurrentView('landing')}
        />
      ) : currentView === 'signup' ? (
        <Signup
          onNavigateLogin={() => setCurrentView('login')}
          onNavigateLanding={() => setCurrentView('landing')}
        />
      ) : (
        <Landing
          onNavigateLogin={() => setCurrentView('login')}
          onNavigateSignup={() => setCurrentView('signup')}
        />
      )}
    </div>
  );
}

