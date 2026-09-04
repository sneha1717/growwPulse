import { create } from 'zustand';
import { api } from '../api/client';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('pulse_token') || null,
  isAuthenticated: !!localStorage.getItem('pulse_token'),
  isLoading: true,

  initAuth: async () => {
    const token = localStorage.getItem('pulse_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const res = await api.getMe();
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      localStorage.removeItem('pulse_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('pulse_token', res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
    return res;
  },

  signup: async (email, password, name) => {
    const res = await api.signup(email, password, name);
    localStorage.setItem('pulse_token', res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
    return res;
  },

  guestLogin: async () => {
    const res = await api.guestLogin();
    localStorage.setItem('pulse_token', res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
    return res;
  },

  logout: () => {
    localStorage.removeItem('pulse_token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
