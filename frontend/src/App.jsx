import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useWatchlistStore } from './store/watchlistStore';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();
  const { fetchWatchlists } = useWatchlistStore();
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'signup'

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlists();
    }
  }, [isAuthenticated, fetchWatchlists]);

  // Page animation variants (cross-fade / subtle slide)
  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E17]">
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key="dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Dashboard />
          </motion.div>
        ) : currentView === 'login' ? (
          <motion.div
            key="login"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Login
              onNavigateSignup={() => setCurrentView('signup')}
              onNavigateLanding={() => setCurrentView('landing')}
            />
          </motion.div>
        ) : currentView === 'signup' ? (
          <motion.div
            key="signup"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Signup
              onNavigateLogin={() => setCurrentView('login')}
              onNavigateLanding={() => setCurrentView('landing')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Landing
              onNavigateLogin={() => setCurrentView('login')}
              onNavigateSignup={() => setCurrentView('signup')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
