import { create } from 'zustand';
import { api } from '../api/client';

export const DEFAULT_WEIGHTS = {
  w1: 2.5,
  w2: 1.8,
  w3: 2.2,
  w4: 0.8
};

export const useWatchlistStore = create((set, get) => ({
  watchlists: [],
  activeWatchlistId: null,
  feedData: null,
  healthData: null,
  correlationData: null,
  timelineSlices: [],
  selectedTimelineId: 'now',
  algorithmWeights: { ...DEFAULT_WEIGHTS },
  isLoading: false,
  isRefreshing: false,
  isCommandPaletteOpen: false,
  isShareModalOpen: false,

  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),
  setSelectedTimelineId: (id) => set({ selectedTimelineId: id }),

  setAlgorithmWeights: (weights) => {
    set({ algorithmWeights: weights });
    const activeId = get().activeWatchlistId;
    if (activeId) {
      // Recalculate client-side immediately for instantaneous feedback
      const currentFeed = get().feedData;
      if (currentFeed) {
        const allItems = [...(currentFeed.needsAttention || []), ...(currentFeed.quiet || [])];
        const recomputed = allItems.map(item => {
          const z = item.scoreBreakdown?.relativeMoveZScore || 0;
          const v = Math.min(item.scoreBreakdown?.volumeAnomalyRatio || 1, 4.0);
          const c = (item.scoreBreakdown?.levelCrossings?.length || 0) > 0 ? 1 : 0;
          const t = item.scoreBreakdown?.timeDecayBoost || 0.5;

          const newScore = parseFloat((weights.w1 * z + weights.w2 * v + weights.w3 * c + weights.w4 * t).toFixed(2));
          return { ...item, attentionScore: newScore };
        });

        recomputed.sort((a, b) => b.attentionScore - a.attentionScore);

        const needsAttention = [];
        const quiet = [];
        const ATTENTION_THRESHOLD = 4.0;
        const MIN_COUNT = Math.min(2, recomputed.length);

        recomputed.forEach((item, idx) => {
          if (idx < MIN_COUNT || item.attentionScore >= ATTENTION_THRESHOLD) {
            needsAttention.push(item);
          } else {
            quiet.push(item);
          }
        });

        set({
          feedData: {
            ...currentFeed,
            needsAttention,
            quiet,
            attentionCount: needsAttention.length,
            quietCount: quiet.length,
            appliedWeights: weights
          }
        });
      }

      // Also persist to backend
      api.getFeed(activeId, weights).then(res => {
        set({ feedData: res });
      }).catch(() => {});
    }
  },

  resetAlgorithmWeights: () => {
    get().setAlgorithmWeights({ ...DEFAULT_WEIGHTS });
  },

  fetchWatchlists: async () => {
    try {
      const res = await api.getWatchlists();
      const currentActive = get().activeWatchlistId;
      const defaultId = res.watchlists.length > 0 ? (currentActive || res.watchlists[0].id) : null;
      
      set({ watchlists: res.watchlists, activeWatchlistId: defaultId });
      
      if (defaultId) {
        get().loadWatchlistData(defaultId);
      }
    } catch (err) {
      console.error('Failed to fetch watchlists:', err);
    }
  },

  setActiveWatchlist: (id) => {
    set({ activeWatchlistId: id, selectedTimelineId: 'now' });
    get().loadWatchlistData(id);
  },

  loadWatchlistData: async (id, isSilent = false) => {
    if (!id) return;
    if (!isSilent) set({ isLoading: true });
    else set({ isRefreshing: true });

    try {
      const weights = get().algorithmWeights;
      const [feedRes, healthRes, timelineRes] = await Promise.all([
        api.getFeed(id, weights),
        api.getHealth(id).catch(() => null),
        api.getTimeline(id).catch(() => ({ slices: [] }))
      ]);

      set({
        feedData: feedRes,
        healthData: healthRes?.health || null,
        timelineSlices: timelineRes?.slices || [],
        isLoading: false,
        isRefreshing: false
      });
    } catch (err) {
      console.error('Failed to load watchlist data:', err);
      set({ isLoading: false, isRefreshing: false });
    }
  },

  createWatchlist: async (name, description, tickers) => {
    const res = await api.createWatchlist(name, description, tickers);
    await get().fetchWatchlists();
    get().setActiveWatchlist(res.watchlist.id);
    return res.watchlist;
  },

  deleteWatchlist: async (id) => {
    await api.deleteWatchlist(id);
    await get().fetchWatchlists();
  },

  addTicker: async (ticker) => {
    const activeId = get().activeWatchlistId;
    if (!activeId) return;
    await api.addTicker(activeId, ticker);
    await get().loadWatchlistData(activeId, true);
    get().fetchWatchlists();
  },

  removeTicker: async (ticker) => {
    const activeId = get().activeWatchlistId;
    if (!activeId) return;
    await api.removeTicker(activeId, ticker);
    await get().loadWatchlistData(activeId, true);
    get().fetchWatchlists();
  },

  simulateMarketShock: async (ticker, shockPct, volumeBoost) => {
    await api.simulateShock(ticker, shockPct, volumeBoost);
    const activeId = get().activeWatchlistId;
    if (activeId) {
      await get().loadWatchlistData(activeId, true);
    }
  }
}));
