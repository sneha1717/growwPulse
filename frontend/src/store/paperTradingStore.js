import { create } from 'zustand';

const STORAGE_KEY = 'pulse_paper_portfolio_v1';
const INITIAL_CASH = 1000000; // ₹10,00,000 default virtual trading pool

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading paper portfolio:', e);
  }
  return {
    cash: INITIAL_CASH,
    initialCapital: INITIAL_CASH,
    currencyPrefix: '₹',
    holdings: [
      {
        ticker: 'RELIANCE',
        companyName: 'Reliance Industries Ltd',
        shares: 50,
        avgBuyPrice: 2950.00,
        currentPrice: 3012.40,
        symbolPrefix: '₹',
        buyTime: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        ticker: 'ZOMATO',
        companyName: 'Zomato Limited',
        shares: 600,
        avgBuyPrice: 252.00,
        currentPrice: 268.40,
        symbolPrefix: '₹',
        buyTime: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    trades: [
      {
        id: 'ord_1',
        ticker: 'RELIANCE',
        type: 'BUY',
        shares: 50,
        price: 2950.00,
        total: 147500.00,
        symbolPrefix: '₹',
        timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(),
        rationale: 'Triage Inflow Alert: Low volatility anchor with 1.9x volume surge'
      },
      {
        id: 'ord_2',
        ticker: 'ZOMATO',
        type: 'BUY',
        shares: 600,
        price: 252.00,
        total: 151200.00,
        symbolPrefix: '₹',
        timestamp: new Date(Date.now() - 86400000).toLocaleString(),
        rationale: 'Breakout Flag: +5.0% move with 3.5x average institutional volume'
      }
    ],
    realizedPnL: 8400.00,
    winningTrades: 3,
    totalClosedTrades: 4
  };
}

function saveState(state) {
  try {
    const toSave = {
      cash: state.cash,
      initialCapital: state.initialCapital,
      currencyPrefix: state.currencyPrefix,
      holdings: state.holdings,
      trades: state.trades,
      realizedPnL: state.realizedPnL,
      winningTrades: state.winningTrades,
      totalClosedTrades: state.totalClosedTrades
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving paper portfolio:', e);
  }
}

export const usePaperTradingStore = create((set, get) => {
  const initial = loadInitialState();

  return {
    ...initial,
    isTradeModalOpen: false,
    selectedTradeTicker: null,

    openTradeModal: (ticker = null) => set({ isTradeModalOpen: true, selectedTradeTicker: ticker }),
    closeTradeModal: () => set({ isTradeModalOpen: false, selectedTradeTicker: null }),

    setCurrencyPrefix: (prefix) => {
      set({ currencyPrefix: prefix });
      saveState(get());
    },

    updateMarketPrices: (items) => {
      if (!items || items.length === 0) return;
      const priceMap = new Map(items.map(i => [i.ticker, { price: i.price, name: i.companyName || i.ticker, prefix: i.symbolPrefix || '₹' }]));
      
      const updatedHoldings = get().holdings.map(h => {
        const live = priceMap.get(h.ticker);
        if (live) {
          return {
            ...h,
            currentPrice: live.price,
            companyName: live.name || h.companyName,
            symbolPrefix: live.prefix || h.symbolPrefix
          };
        }
        return h;
      });

      set({ holdings: updatedHoldings });
      saveState(get());
    },

    buyStock: (ticker, shares, price, symbolPrefix = '₹', rationale = 'Manual Trade Execution') => {
      const sharesNum = parseInt(shares, 10);
      const priceNum = parseFloat(price);
      if (isNaN(sharesNum) || sharesNum <= 0 || isNaN(priceNum) || priceNum <= 0) return { success: false, error: 'Invalid order parameters' };

      const totalCost = sharesNum * priceNum;
      const currentCash = get().cash;

      if (totalCost > currentCash) {
        return { success: false, error: `Insufficient virtual capital. Required: ${symbolPrefix}${totalCost.toLocaleString()}, Available: ${symbolPrefix}${currentCash.toLocaleString()}` };
      }

      const currentHoldings = [...get().holdings];
      const existingIdx = currentHoldings.findIndex(h => h.ticker === ticker);

      if (existingIdx >= 0) {
        const exist = currentHoldings[existingIdx];
        const newShares = exist.shares + sharesNum;
        const newAvgPrice = parseFloat(((exist.shares * exist.avgBuyPrice + totalCost) / newShares).toFixed(2));
        currentHoldings[existingIdx] = {
          ...exist,
          shares: newShares,
          avgBuyPrice: newAvgPrice,
          currentPrice: priceNum,
          symbolPrefix
        };
      } else {
        currentHoldings.push({
          ticker,
          companyName: ticker,
          shares: sharesNum,
          avgBuyPrice: priceNum,
          currentPrice: priceNum,
          symbolPrefix,
          buyTime: new Date().toISOString()
        });
      }

      const newTrade = {
        id: `ord_${Date.now()}`,
        ticker,
        type: 'BUY',
        shares: sharesNum,
        price: priceNum,
        total: totalCost,
        symbolPrefix,
        timestamp: new Date().toLocaleString(),
        rationale
      };

      const newState = {
        cash: parseFloat((currentCash - totalCost).toFixed(2)),
        holdings: currentHoldings,
        trades: [newTrade, ...get().trades],
        isTradeModalOpen: false,
        selectedTradeTicker: null
      };

      set(newState);
      saveState(get());
      return { success: true };
    },

    sellStock: (ticker, shares, price) => {
      const sharesNum = parseInt(shares, 10);
      const priceNum = parseFloat(price);
      if (isNaN(sharesNum) || sharesNum <= 0) return { success: false, error: 'Invalid share quantity' };

      const currentHoldings = [...get().holdings];
      const existingIdx = currentHoldings.findIndex(h => h.ticker === ticker);

      if (existingIdx < 0) {
        return { success: false, error: `No active position in ${ticker}` };
      }

      const exist = currentHoldings[existingIdx];
      if (sharesNum > exist.shares) {
        return { success: false, error: `Cannot sell more than held shares (${exist.shares})` };
      }

      const proceeds = sharesNum * priceNum;
      const profit = (priceNum - exist.avgBuyPrice) * sharesNum;

      if (sharesNum === exist.shares) {
        currentHoldings.splice(existingIdx, 1);
      } else {
        currentHoldings[existingIdx] = {
          ...exist,
          shares: exist.shares - sharesNum,
          currentPrice: priceNum
        };
      }

      const newTrade = {
        id: `ord_${Date.now()}`,
        ticker,
        type: 'SELL',
        shares: sharesNum,
        price: priceNum,
        total: proceeds,
        symbolPrefix: exist.symbolPrefix || '₹',
        timestamp: new Date().toLocaleString(),
        rationale: profit >= 0 ? `Profit Target Hit (+${profit.toFixed(2)})` : `Stop-Loss Executed (${profit.toFixed(2)})`
      };

      const isWin = profit > 0;
      const newState = {
        cash: parseFloat((get().cash + proceeds).toFixed(2)),
        realizedPnL: parseFloat((get().realizedPnL + profit).toFixed(2)),
        winningTrades: get().winningTrades + (isWin ? 1 : 0),
        totalClosedTrades: get().totalClosedTrades + 1,
        holdings: currentHoldings,
        trades: [newTrade, ...get().trades],
        isTradeModalOpen: false,
        selectedTradeTicker: null
      };

      set(newState);
      saveState(get());
      return { success: true, profit };
    },

    resetPortfolio: () => {
      localStorage.removeItem(STORAGE_KEY);
      const fresh = {
        cash: INITIAL_CASH,
        initialCapital: INITIAL_CASH,
        currencyPrefix: '₹',
        holdings: [],
        trades: [],
        realizedPnL: 0,
        winningTrades: 0,
        totalClosedTrades: 0,
        isTradeModalOpen: false,
        selectedTradeTicker: null
      };
      set(fresh);
      saveState(get());
    }
  };
});
