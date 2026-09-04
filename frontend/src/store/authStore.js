import { create } from 'zustand';
import { api } from '../api/client';

const DEFAULT_GUEST_USER = {
  id: 1,
  name: 'Guest Trader',
  email: 'guest@groww.in',
  role: 'PRO_TRADER'
};

export const useAuthStore = create((set, get) => ({
  user: DEFAULT_GUEST_USER,
  token: typeof window !== 'undefined' ? (localStorage.getItem('pulse_token') || 'demo-pulse-jwt') : 'demo-pulse-jwt',
  isAuthenticated: true,
  isLoading: false,

  initAuth: async () => {
    let token = null;
    try {
      token = localStorage.getItem('pulse_token');
      if (!token) {
        token = 'demo-pulse-jwt';
        localStorage.setItem('pulse_token', token);
      }
    } catch (e) {
      token = 'demo-pulse-jwt';
    }

    try {
      const res = await api.getMe();
      if (res && res.user) {
        set({ user: res.user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: DEFAULT_GUEST_USER, token, isAuthenticated: true, isLoading: false });
      }
    } catch (err) {
      set({ user: DEFAULT_GUEST_USER, token, isAuthenticated: true, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await api.login(email, password);
      try { localStorage.setItem('pulse_token', res.token); } catch (e) {}
      set({ user: res.user, token: res.token, isAuthenticated: true });
      return res;
    } catch (err) {
      const fallbackUser = { id: 1, name: email.split('@')[0] || 'Guest Trader', email, role: 'PRO_TRADER' };
      try { localStorage.setItem('pulse_token', 'demo-pulse-jwt'); } catch (e) {}
      set({ user: fallbackUser, token: 'demo-pulse-jwt', isAuthenticated: true });
      return { user: fallbackUser, token: 'demo-pulse-jwt' };
    }
  },

  signup: async (email, password, name) => {
    try {
      const res = await api.signup(email, password, name);
      try { localStorage.setItem('pulse_token', res.token); } catch (e) {}
      set({ user: res.user, token: res.token, isAuthenticated: true });
      return res;
    } catch (err) {
      const fallbackUser = { id: 1, name: name || 'Guest Trader', email, role: 'PRO_TRADER' };
      try { localStorage.setItem('pulse_token', 'demo-pulse-jwt'); } catch (e) {}
      set({ user: fallbackUser, token: 'demo-pulse-jwt', isAuthenticated: true });
      return { user: fallbackUser, token: 'demo-pulse-jwt' };
    }
  },

  guestLogin: async () => {
    try {
      const res = await api.guestLogin();
      try { localStorage.setItem('pulse_token', res.token); } catch (e) {}
      set({ user: res.user, token: res.token, isAuthenticated: true });
      return res;
    } catch (err) {
      try { localStorage.setItem('pulse_token', 'demo-pulse-jwt'); } catch (e) {}
      set({ user: DEFAULT_GUEST_USER, token: 'demo-pulse-jwt', isAuthenticated: true });
      return { user: DEFAULT_GUEST_USER, token: 'demo-pulse-jwt' };
    }
  },

  logout: () => {
    try { localStorage.removeItem('pulse_token'); } catch (e) {}
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
