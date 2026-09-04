import { create } from 'zustand';
import { api } from '../api/client';
import { 
  DEFAULT_WATCHLISTS, 
  generateMockFeed, 
  generateMockHealth, 
  generateMockTimeline 
} from '../api/mockFallback';

export const DEFAULT_WEIGHTS = {
  w1: 2.5,
  w2: 1.8,
  w3: 2.2,
  w4: 0.8
};

export const useWatchlistStore = create((set, get) => ({
  watchlists: DEFAULT_WATCHLISTS,
  activeWatchlistId: 1,
  feedData: generateMockFeed(1),
  healthData: generateMockHealth(1).health,
  correlationData: null,
  timelineSlices: generateMockTimeline(1).slices,
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
      if (res && res.watchlists && res.watchlists.length > 0) {
        const currentActive = get().activeWatchlistId;
        const defaultId = currentActive || res.watchlists[0].id;
        set({ watchlists: res.watchlists, activeWatchlistId: defaultId });
        get().loadWatchlistData(defaultId, true);
      } else {
        const currentActive = get().activeWatchlistId || 1;
        set({ watchlists: DEFAULT_WATCHLISTS, activeWatchlistId: currentActive });
        get().loadWatchlistData(currentActive, true);
      }
    } catch (err) {
      console.warn('Failed to fetch watchlists from backend, keeping fallback:', err);
      const currentActive = get().activeWatchlistId || 1;
      get().loadWatchlistData(currentActive, true);
    }
  },

  setActiveWatchlist: (id) => {
    set({ activeWatchlistId: id, selectedTimelineId: 'now' });
    get().loadWatchlistData(id);
  },

  loadWatchlistData: async (id, isSilent = false) => {
    if (!id) return;
    if (isSilent) set({ isRefreshing: true });

    try {
      const weights = get().algorithmWeights;
      const [feedRes, healthRes, timelineRes] = await Promise.all([
        api.getFeed(id, weights),
        api.getHealth(id).catch(() => null),
        api.getTimeline(id).catch(() => ({ slices: [] }))
      ]);

      set({
        feedData: feedRes || generateMockFeed(id, weights),
        healthData: healthRes?.health || generateMockHealth(id).health,
        timelineSlices: timelineRes?.slices && timelineRes.slices.length > 0 ? timelineRes.slices : generateMockTimeline(id).slices,
        isLoading: false,
        isRefreshing: false
      });
    } catch (err) {
      console.warn('Failed to load watchlist data, using offline fallback:', err);
      const weights = get().algorithmWeights;
      set({ 
        feedData: generateMockFeed(id, weights),
        healthData: generateMockHealth(id).health,
        timelineSlices: generateMockTimeline(id).slices,
        isLoading: false, 
        isRefreshing: false 
      });
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
