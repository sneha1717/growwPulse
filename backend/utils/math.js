/**
 * Statistical and financial mathematics utilities for Pulse
 */

function mean(arr) {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
}

function standardDeviation(arr) {
  if (!arr || arr.length < 2) return 0.01; // Avoid divide by zero
  const m = mean(arr);
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/**
 * Trailing daily returns volatility (standard deviation of daily % changes)
 */
function calculateVolatility(pctChanges) {
  if (!pctChanges || pctChanges.length < 2) return 1.5; // default 1.5% fallback daily vol
  const std = standardDeviation(pctChanges);
  return Math.max(std, 0.2); // floor to avoid extreme z-scores
}

/**
 * Z-score: (move - mean) / stdDev
 */
function calculateZScore(value, stdDev) {
  if (!stdDev || stdDev === 0) return 0;
  return Math.abs(value) / stdDev;
}

/**
 * Pearson Correlation Coefficient between two series
 * r = sum((x - mean_x) * (y - mean_y)) / (sqrt(sum(sq_x)) * sqrt(sum(sq_y)))
 */
function pearsonCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const xSlice = x.slice(-n);
  const ySlice = y.slice(-n);

  const meanX = mean(xSlice);
  const meanY = mean(ySlice);

  let num = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = xSlice[i] - meanX;
    const diffY = ySlice[i] - meanY;
    num += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denom = Math.sqrt(denomX * denomY);
  if (denom === 0) return 0;

  const r = num / denom;
  return Math.max(-1, Math.min(1, parseFloat(r.toFixed(3))));
}

/**
 * Compute symmetric correlation matrix for an array of tickers
 */
function calculateCorrelationMatrix(tickers, historyMap) {
  const matrix = {};
  
  for (const ticker1 of tickers) {
    matrix[ticker1] = {};
    const returns1 = historyMap[ticker1]?.dailyReturns || [];

    for (const ticker2 of tickers) {
      if (ticker1 === ticker2) {
        matrix[ticker1][ticker2] = 1.0;
      } else if (matrix[ticker2] && matrix[ticker2][ticker1] !== undefined) {
        matrix[ticker1][ticker2] = matrix[ticker2][ticker1];
      } else {
        const returns2 = historyMap[ticker2]?.dailyReturns || [];
        matrix[ticker1][ticker2] = pearsonCorrelation(returns1, returns2);
      }
    }
  }

  return matrix;
}

/**
 * Watchlist Health Score (0 - 100)
 * Evaluates:
 * - Volatility balance (35%): lower average volatility relative to extreme moves is healthier
 * - Correlation / Diversification (35%): lower average pairwise correlation indicates better diversification
 * - Momentum balance (30%): balanced mix of positive momentum vs deep losses
 */
function calculateHealthScore(itemsData, correlationMatrix) {
  if (!itemsData || itemsData.length === 0) {
    return { score: 75, riskLevel: 'Moderate', metrics: { volatility: 70, diversification: 80, momentum: 75 } };
  }

  // 1. Volatility Score (0-100, 100 is stable & predictable)
  const avgVol = mean(itemsData.map(d => d.volatility || 1.8));
  // ideal vol between 1.0% and 2.5% daily
  const volScore = Math.max(10, Math.min(100, Math.round(100 - (avgVol - 1.2) * 20)));

  // 2. Diversification Score (0-100, 100 is well-diversified)
  let pairCount = 0;
  let totalCorr = 0;
  const tickers = Object.keys(correlationMatrix || {});
  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      const r = correlationMatrix[tickers[i]]?.[tickers[j]];
      if (r !== undefined) {
        totalCorr += Math.abs(r);
        pairCount++;
      }
    }
  }
  const avgCorr = pairCount > 0 ? totalCorr / pairCount : 0.4;
  const divScore = Math.max(15, Math.min(100, Math.round((1 - avgCorr) * 100)));

  // 3. Momentum Score (0-100)
  const avgReturn = mean(itemsData.map(d => d.pct_change_day || 0));
  const momScore = Math.max(10, Math.min(100, Math.round(50 + avgReturn * 8)));

  const finalScore = Math.round(volScore * 0.35 + divScore * 0.35 + momScore * 0.30);
  
  let riskLevel = 'Balanced';
  if (finalScore >= 80) riskLevel = 'Resilient';
  else if (finalScore >= 60) riskLevel = 'Moderate';
  else if (finalScore >= 40) riskLevel = 'Elevated Risk';
  else riskLevel = 'High Volatility';

  return {
    score: Math.max(1, Math.min(100, finalScore)),
    riskLevel,
    metrics: {
      volatility: volScore,
      diversification: divScore,
      momentum: momScore,
      averageCorrelation: parseFloat(avgCorr.toFixed(2)),
      averageDailyVolatility: parseFloat(avgVol.toFixed(2)) + '%'
    }
  };
}

module.exports = {
  mean,
  standardDeviation,
  calculateVolatility,
  calculateZScore,
  pearsonCorrelation,
  calculateCorrelationMatrix,
  calculateHealthScore
};
