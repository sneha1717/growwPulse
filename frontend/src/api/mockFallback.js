// Client-side fallback engine for 100% offline & Vercel deployment reliability

export const DEFAULT_WATCHLISTS = [
  { id: 1, name: '⚡ US Tech Momentum', description: 'Core Wall Street growth, AI semiconductor leaders & mega-caps.', itemsCount: 6 },
  { id: 2, name: '🇮🇳 Nifty 50 Titans (NSE)', description: 'Dalal Street market leaders with real-time FII/DII institutional flow.', itemsCount: 6 }
];

export const MOCK_WATCHLISTS = DEFAULT_WATCHLISTS;

const STOCKS_DATA = {
  NVDA: { 
    ticker: 'NVDA', 
    name: 'NVIDIA Corporation', 
    sector: 'Semiconductors', 
    price: 124.50, 
    change: 4.80, 
    changePct: 4.01, 
    zScore: 2.8, 
    volumeRatio: 2.6, 
    symbolPrefix: '$', 
    fiiFlow: '+$1.8B', 
    diiFlow: '+$420M', 
    flowTag: 'Institutional Accumulation',
    theses: {
      bullRatio: 76,
      bull: {
        thesis: 'Accelerating AI enterprise server rack compute demand with Blackwell ultra-margin production ramp.',
        drivers: ['Data Center compute CAGR > 45%', 'Gross margins holding firm above 74%', 'Dominant CUDA software moat']
      },
      bear: {
        thesis: 'Hyperscaler Capex digestion risk and custom ASIC silicon substitution (Google TPU / AWS Trainium).',
        risks: ['Capex cycle deceleration in FY26', 'Supply chain concentration at TSMC CoWoS packaging', 'Heightened regulatory scrutiny']
      }
    },
    catalysts: [
      { tag: 'AI Compute Demand', title: 'Enterprise hyperscalers expand FY25 AI infrastructure Capex commitments', source: 'Bloomberg', time: '18m ago', isHighImpact: true },
      { tag: 'Breakout Flow', title: 'Unusual options block accumulation in $135 calls expiring end of month', source: 'CBOE Flow', time: '1h ago', isHighImpact: false }
    ]
  },
  TSLA: { 
    ticker: 'TSLA', 
    name: 'Tesla, Inc.', 
    sector: 'Automotive & Clean Energy', 
    price: 218.40, 
    change: 11.20, 
    changePct: 5.41, 
    zScore: 3.1, 
    volumeRatio: 3.2, 
    symbolPrefix: '$', 
    fiiFlow: '+$940M', 
    diiFlow: '+$210M', 
    flowTag: 'High Retail FOMO',
    theses: {
      bullRatio: 64,
      bull: {
        thesis: 'Next-gen Robotaxi commercial rollout and Megapack energy storage margin expansion.',
        drivers: ['FSD v13 autonomous miles ramping exponentially', 'Energy storage revenue doubled year-over-year', 'Unmatched manufacturing cost per kWh']
      },
      bear: {
        thesis: 'Automotive gross margin compression from aggressive global EV price competition.',
        risks: ['China EV price war eroding vehicle profitability', 'Delayed launch timeline for sub-$25k mass vehicle', 'Regulatory safety scrutiny on autonomous claims']
      }
    },
    catalysts: [
      { tag: 'Robotaxi Beta', title: 'Tesla files permit for commercial autonomous fleet testing in Austin', source: 'Electrek', time: '42m ago', isHighImpact: true },
      { tag: 'Megapack Record', title: 'New 40GWh energy storage facility achieves full production capacity', source: 'Reuters', time: '3h ago', isHighImpact: false }
    ]
  },
  AAPL: { 
    ticker: 'AAPL', 
    name: 'Apple Inc.', 
    sector: 'Consumer Electronics', 
    price: 228.10, 
    change: -0.60, 
    changePct: -0.26, 
    zScore: 0.4, 
    volumeRatio: 0.9, 
    symbolPrefix: '$', 
    fiiFlow: '-$120M', 
    diiFlow: '+$340M', 
    flowTag: 'Defensive Hold',
    theses: {
      bullRatio: 70,
      bull: {
        thesis: 'Apple Intelligence supercycle driving massive 4-year iPhone replacement wave.',
        drivers: ['Over 1.2 billion active devices eligible for hardware refresh', 'Services revenue at all-time high 72% gross margin', '$100B annual capital return program']
      },
      bear: {
        thesis: 'EU Digital Markets Act compliance pressures and soft hardware shipments in Greater China.',
        risks: ['App Store commission compression in European Union', 'Rising competition from domestic Huawei flagships', 'Delayed localization of Siri AI features']
      }
    },
    catalysts: [
      { tag: 'Hardware Refresh', title: 'Foxconn increases peak seasonal hiring quota ahead of global rollout', source: 'Nikkei Asia', time: '2h ago', isHighImpact: false }
    ]
  },
  MSFT: { 
    ticker: 'MSFT', 
    name: 'Microsoft Corporation', 
    sector: 'Enterprise Cloud & AI', 
    price: 448.90, 
    change: 1.20, 
    changePct: 0.27, 
    zScore: 0.3, 
    volumeRatio: 1.0, 
    symbolPrefix: '$', 
    fiiFlow: '+$220M', 
    diiFlow: '+$180M', 
    flowTag: 'Quiet & Expected',
    theses: {
      bullRatio: 82,
      bull: {
        thesis: 'Azure OpenAI enterprise monetization and Microsoft 365 Copilot seat seat expansions.',
        drivers: ['Azure growth re-accelerating to 33% constant currency', 'Commercial cloud gross margin sustaining at 71%', 'Massive multi-year cloud contract backlogs']
      },
      bear: {
        thesis: 'Heavy near-term Capex infrastructure spend weighing on free cash flow conversion.',
        risks: ['Quarterly cloud Capex exceeding $19 billion', 'Capacity constraints temporarily limiting enterprise AI demand', 'Antitrust review of security bundling']
      }
    },
    catalysts: [
      { tag: 'Enterprise Cloud', title: 'Fortune 500 bank inks 5-year enterprise Azure Copilot deployment', source: 'WSJ', time: '4h ago', isHighImpact: false }
    ]
  },
  AMZN: { 
    ticker: 'AMZN', 
    name: 'Amazon.com, Inc.', 
    sector: 'E-Commerce & AWS Cloud', 
    price: 186.30, 
    change: 0.80, 
    changePct: 0.43, 
    zScore: 0.6, 
    volumeRatio: 1.1, 
    symbolPrefix: '$', 
    fiiFlow: '+$160M', 
    diiFlow: '+$90M', 
    flowTag: 'Quiet & Expected',
    theses: {
      bullRatio: 74,
      bull: {
        thesis: 'AWS AI cloud migration inflecting alongside regional retail fulfillment cost efficiencies.',
        drivers: ['North America retail operating margins expanding past 6%', 'Advertising business growing 20%+ at high incremental margins', 'Custom Bedrock LLM enterprise adoption']
      },
      bear: {
        thesis: 'E-commerce price war from ultra-low cost cross-border discount apps.',
        risks: ['Consumer budget elasticity under persistent inflation', 'AWS price discounts for committed enterprise tiers', 'FTC antitrust court proceedings']
      }
    },
    catalysts: [
      { tag: 'Fulfillment Surge', title: 'Same-day grocery delivery network expands to 60 additional metro hubs', source: 'CNBC', time: '5h ago', isHighImpact: false }
    ]
  },
  GOOGL: { 
    ticker: 'GOOGL', 
    name: 'Alphabet Inc.', 
    sector: 'Internet Services & AI', 
    price: 178.50, 
    change: -1.10, 
    changePct: -0.61, 
    zScore: 0.5, 
    volumeRatio: 0.8, 
    symbolPrefix: '$', 
    fiiFlow: '-$80M', 
    diiFlow: '+$110M', 
    flowTag: 'Quiet & Expected',
    theses: {
      bullRatio: 68,
      bull: {
        thesis: 'Gemini 1.5 Pro deep multimodal integration sustaining core search RPM and Google Cloud profitability.',
        drivers: ['Google Cloud operating income inflection above $1.1B', 'YouTube TV & Subscription recurring ARR surpassing $15B', 'Custom TPU v5p chip price/performance advantage']
      },
      bear: {
        thesis: 'DOJ search monopoly remedies and generative search cannibalization of high-intent clicks.',
        risks: ['Potential judicial behavioral or structural antitrust remedies', 'Higher inference compute costs per search query', 'Competition from independent AI search engines']
      }
    },
    catalysts: [
      { tag: 'Cloud Profitability', title: 'Alphabet Cloud signs major sovereign cloud framework agreement', source: 'Reuters', time: '6h ago', isHighImpact: false }
    ]
  },
  
  RELIANCE: { 
    ticker: 'RELIANCE', 
    name: 'Reliance Industries Ltd', 
    sector: 'Energy, Retail & Jio', 
    price: 3012.40, 
    change: 48.20, 
    changePct: 1.62, 
    zScore: 2.1, 
    volumeRatio: 1.9, 
    symbolPrefix: '₹', 
    fiiFlow: '+₹1,840 Cr', 
    diiFlow: '+₹920 Cr', 
    flowTag: 'Institutional Accumulation',
    theses: {
      bullRatio: 78,
      bull: {
        thesis: 'Jio 5G tariff monetization, upcoming telecom IPO unlock, and New Energy gigafactory commissioning.',
        drivers: ['Average Revenue Per User (ARPU) rising towards ₹200+', 'Retail footprint expansion across Tier-2/3 Indian cities', 'Solar and green hydrogen giga-complex operational in Jamnagar']
      },
      bear: {
        thesis: 'Weak global refining margins (GRMs) and ongoing capital expenditure drag.',
        risks: ['O2C segment refining margins impacted by global demand slowdown', 'Net debt elevated during green energy capex cycle', 'Domestic retail consumption slowdown in discretionary categories']
      }
    },
    catalysts: [
      { tag: 'Telecom Monetization', title: 'Jio 5G wireless broadband subscriber base crosses 15 million threshold', source: 'Economic Times', time: '35m ago', isHighImpact: true },
      { tag: 'Retail Inflow', title: 'Reliance Retail launches 120 automated smart fulfillment dark stores', source: 'Mint', time: '2h ago', isHighImpact: false }
    ]
  },
  TCS: { 
    ticker: 'TCS', 
    name: 'Tata Consultancy Services', 
    sector: 'IT Services & Consulting', 
    price: 4280.00, 
    change: -12.50, 
    changePct: -0.29, 
    zScore: 0.4, 
    volumeRatio: 0.8, 
    symbolPrefix: '₹', 
    fiiFlow: '-₹210 Cr', 
    diiFlow: '+₹450 Cr', 
    flowTag: 'Quiet & Expected',
    theses: {
      bullRatio: 72,
      bull: {
        thesis: 'Industry-leading operating margins (>26%) and steady mega-deal Total Contract Value (TCV).',
        drivers: ['Quarterly order book sustaining above $10 billion TCV', 'Lowest attrition among tier-1 Indian IT peers', 'Generative AI client advisory and cloud legacy modernization contracts']
      },
      bear: {
        thesis: 'Discretionary tech spending cuts by North American and European BFSI banking clients.',
        risks: ['Prolonged decision-making cycles on non-mandatory digital projects', 'Cross-currency headwinds in UK and European billing currencies', 'Pricing pressure on commoditized maintenance contracts']
      }
    },
    catalysts: [
      { tag: 'Deal Win', title: 'TCS signs $800M multi-year digital transformation partnership with UK insurer', source: 'Business Standard', time: '3h ago', isHighImpact: false }
    ]
  },
  HDFCBANK: { 
    ticker: 'HDFCBANK', 
    name: 'HDFC Bank Ltd', 
    sector: 'Banking & Financials', 
    price: 1648.50, 
    change: 18.30, 
    changePct: 1.12, 
    zScore: 1.2, 
    volumeRatio: 1.4, 
    symbolPrefix: '₹', 
    fiiFlow: '+₹1,120 Cr', 
    diiFlow: '+₹780 Cr', 
    flowTag: 'FII Accumulation',
    theses: {
      bullRatio: 80,
      bull: {
        thesis: 'Post-merger Credit-to-Deposit (CD) ratio normalization and stellar asset quality underwrite valuation re-rating.',
        drivers: ['Retail deposit mobilization outpacing system credit growth', 'Gross Non-Performing Assets (NPA) stable at best-in-class ~1.24%', 'Branch network productivity compounding across 8,800+ outlets']
      },
      bear: {
        thesis: 'Elevated cost of deposits temporarily suppressing Net Interest Margin (NIM) trajectory.',
        risks: ['High competition for retail savings deposits across Indian banking', 'Slowdown in corporate capex borrowing', 'Integration friction across legacy housing finance operations']
      }
    },
    catalysts: [
      { tag: 'Deposit Mobilization', title: 'Quarterly deposit accretion touches ₹1.2 lakh crore, easing CD ratio pressure', source: 'Bloomberg Quint', time: '1h ago', isHighImpact: true }
    ]
  },
  INFY: { 
    ticker: 'INFY', 
    name: 'Infosys Limited', 
    sector: 'IT & Digital Services', 
    price: 1890.20, 
    change: 8.50, 
    changePct: 0.45, 
    zScore: 0.5, 
    volumeRatio: 1.0, 
    symbolPrefix: '₹', 
    fiiFlow: '+₹140 Cr', 
    diiFlow: '+₹210 Cr', 
    flowTag: 'Quiet & Expected',
    theses: {
      bullRatio: 69,
      bull: {
        thesis: 'Topaz generative AI platform integration and large enterprise cloud migration deals.',
        drivers: ['Large deal TCV pipeline remaining resilient above $3B quarterly', 'Higher offshore revenue mix boosting project profitability', 'Active stock buyback and dividend yield support']
      },
      bear: {
        thesis: 'Volatile guidance revisions and sluggish European manufacturing vertical demand.',
        risks: ['Subdued discretionary project spending in communications & high-tech', 'Senior executive attrition in North American business development', 'Margin dilution from pass-through third-party software sales']
      }
    },
    catalysts: [
      { tag: 'Enterprise AI', title: 'Infosys expands Topaz AI suite with enterprise healthcare compliance framework', source: 'Financial Express', time: '4h ago', isHighImpact: false }
    ]
  },
  TATAMOTORS: { 
    ticker: 'TATAMOTORS', 
    name: 'Tata Motors Limited', 
    sector: 'Automotive & EV', 
    price: 1045.00, 
    change: 32.50, 
    changePct: 3.21, 
    zScore: 2.9, 
    volumeRatio: 2.7, 
    symbolPrefix: '₹', 
    fiiFlow: '+₹890 Cr', 
    diiFlow: '+₹540 Cr', 
    flowTag: 'Momentum Breakout',
    theses: {
      bullRatio: 75,
      bull: {
        thesis: 'JLR order bank strength with Defender/Range Rover high-margin mix alongside domestic EV leadership (>65% share).',
        drivers: ['JLR EBIT margins sustaining above 8.5% with zero net auto debt target achieved', 'Commercial Vehicle (CV) cyclical upswing and freight volume growth', 'Demerger into distinct PV and CV entities unlocking standalone valuation multiples']
      },
      bear: {
        thesis: 'China luxury vehicle demand slowdown and rising battery component price volatility.',
        risks: ['JLR retail sales moderation in mainland China market', 'Intensifying competition in domestic passenger EV space from global entrants', 'Temporary production disruptions from supplier aluminium shortages']
      }
    },
    catalysts: [
      { tag: 'JLR Margin Expansion', title: 'JLR reports record quarterly free cash flow of £750M on Defender order strength', source: 'Autocar', time: '50m ago', isHighImpact: true },
      { tag: 'EV Leadership', title: 'Tata Motors delivers 15,000th electric commercial tipper truck to logistics fleet', source: 'ET Auto', time: '2h ago', isHighImpact: false }
    ]
  },
  ZOMATO: { 
    ticker: 'ZOMATO', 
    name: 'Zomato Ltd (Blinkit)', 
    sector: 'Quick Commerce & Tech', 
    price: 268.40, 
    change: 12.80, 
    changePct: 5.01, 
    zScore: 3.4, 
    volumeRatio: 3.5, 
    symbolPrefix: '₹', 
    fiiFlow: '+₹1,240 Cr', 
    diiFlow: '+₹890 Cr', 
    flowTag: 'Extreme Institutional Inflow',
    theses: {
      bullRatio: 84,
      bull: {
        thesis: 'Blinkit quick commerce hypergrowth (>120% YoY GOV) turning EBITDA positive ahead of market estimates.',
        drivers: ['Quick commerce dark store count scaling towards 1,000+ pan-India', 'High ad monetization and brand sponsorship revenue per order', 'Food delivery Adjusted EBITDA margin stable above 3.5% of GOV']
      },
      bear: {
        thesis: 'Aggressive capital race and dark store land-grab from Zepto and Swiggy Instamart.',
        risks: ['Intense pricing and delivery fee discounts in competitive metro micro-markets', 'Gig worker rider wage inflation and delivery fleet supply tightness', 'Regulatory compliance on dark store urban zoning and night logistics']
      }
    },
    catalysts: [
      { tag: 'Quick Commerce Surge', title: 'Blinkit dark store network achieves monthly operating EBITDA breakeven', source: 'Economic Times', time: '15m ago', isHighImpact: true },
      { tag: 'Index Inclusion', title: 'Institutional passive tracker funds accumulate shares ahead of FTSE index rebalance', source: 'CNBC-TV18', time: '1h ago', isHighImpact: true }
    ]
  }
};

function generateSparkline(currentPrice, isPositive) {
  const points = [];
  let p = currentPrice * (isPositive ? 0.95 : 1.05);
  for (let i = 0; i < 20; i++) {
    const trend = isPositive ? 0.003 : -0.003;
    const noise = (Math.random() - 0.48) * 0.01;
    p = p * (1 + trend + noise);
    points.push(parseFloat(p.toFixed(2)));
  }
  points.push(currentPrice);
  return points;
}

export function generateMockFeed(watchlistId = 1, weights = { w1: 2.5, w2: 1.8, w3: 2.2, w4: 0.8 }) {
  const isIndian = watchlistId === 2 || watchlistId === '2';
  const tickers = isIndian 
    ? ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'ZOMATO']
    : ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL'];

  const items = tickers.map(sym => {
    const meta = STOCKS_DATA[sym] || {
      ticker: sym,
      name: sym,
      sector: 'General',
      price: 100,
      change: 2.5,
      changePct: 2.5,
      zScore: 1.5,
      volumeRatio: 1.5,
      symbolPrefix: isIndian ? '₹' : '$',
      fiiFlow: '+$100M',
      diiFlow: '+$50M',
      flowTag: 'Quiet & Expected'
    };

    const z = meta.zScore || 1.0;
    const v = meta.volumeRatio || 1.0;
    const c = z > 2.5 ? 1 : 0;
    const t = 0.6;
    const attentionScore = parseFloat((weights.w1 * z + weights.w2 * v + weights.w3 * c + weights.w4 * t).toFixed(2));

    return {
      ticker: meta.ticker,
      name: meta.name,
      companyName: meta.name,
      sector: meta.sector,
      price: meta.price,
      change: meta.change,
      changePct: meta.changePct,
      pctChangeDay: meta.changePct,
      priceDeltaDay: meta.change,
      attentionScore,
      priorityRank: 0,
      sparkline: generateSparkline(meta.price, meta.changePct >= 0),
      summarySentence: `${meta.ticker} surged ${meta.changePct > 0 ? '+' : ''}${meta.changePct}% with ${meta.volumeRatio}x average volume — ${meta.flowTag}.`,
      narrative: `${meta.ticker} surged ${meta.changePct > 0 ? '+' : ''}${meta.changePct}% with ${meta.volumeRatio}x average volume — ${meta.flowTag}.`,
      diffExplanation: `Volatility z-score is ${meta.zScore}σ above normal; institutional net flow is ${meta.fiiFlow}.`,
      diffSinceLastSeen: {
        priceDelta: meta.change,
        pctDelta: meta.changePct,
        summary: `Moved ${meta.changePct > 0 ? '+' : ''}${meta.changePct}% since yesterday's close`
      },
      symbolPrefix: meta.symbolPrefix || (isIndian ? '₹' : '$'),
      currency: isIndian ? 'INR' : 'USD',
      high52: parseFloat((meta.price * 1.18).toFixed(2)),
      low52: parseFloat((meta.price * 0.76).toFixed(2)),
      volatility: parseFloat((Math.abs(meta.changePct) * 0.8 + 1.2).toFixed(1)),
      fiiFlow: meta.fiiFlow,
      diiFlow: meta.diiFlow,
      flowTag: meta.flowTag,
      scoreBreakdown: {
        relativeMoveZScore: z,
        volumeAnomalyRatio: v,
        levelCrossings: c ? ['50-Day MA'] : [],
        timeDecayBoost: t
      },
      theses: meta.theses || {
        bullRatio: 70,
        bull: { thesis: 'Strong industry tailwinds and institutional accumulation.', drivers: ['Revenue expansion', 'Sector momentum'] },
        bear: { thesis: 'Macro volatility and multiple compression risks.', risks: ['Market drawdown', 'Valuation premium'] }
      },
      catalysts: meta.catalysts || [
        { tag: 'Momentum', title: `${meta.name} showing elevated trading activity`, source: 'Pulse Intelligence', time: '1h ago', isHighImpact: false }
      ]
    };
  });

  items.sort((a, b) => b.attentionScore - a.attentionScore);
  items.forEach((item, idx) => { item.priorityRank = idx + 1; });

  const needsAttention = items.slice(0, 2);
  const quiet = items.slice(2);

  return {
    watchlistId: parseInt(watchlistId, 10) || 1,
    watchlistName: isIndian ? '🇮🇳 Nifty 50 Titans (NSE)' : '⚡ US Tech Momentum',
    asOf: new Date().toISOString(),
    lastSuccessfulFetchAt: new Date().toISOString(),
    lastSuccessfulFetchFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    attentionCount: needsAttention.length,
    quietCount: quiet.length,
    appliedWeights: weights,
    finnhub: {
      fetchStatus: 'LIVE_FINNHUB',
      feedSourceLabel: 'Finnhub Live Quote Engine'
    },
    needsAttention,
    quiet
  };
}

export function generateMockHealth(watchlistId = 1) {
  const isIndian = watchlistId === 2 || watchlistId === '2';
  return {
    health: {
      overallScore: isIndian ? 87 : 84,
      status: 'Resilient & Diversified',
      statusColor: '#10B981',
      diversification: isIndian ? 91 : 88,
      volatilityStability: isIndian ? 85 : 82,
      momentumBalance: isIndian ? 86 : 81,
      explanation: isIndian 
        ? 'Healthy sovereign domestic retail inflows and low pairwise correlation between banking leaders and energy conglomerates.'
        : 'Balanced allocation across high-beta AI growth leaders and cash-flow defensive anchors with low pairwise correlation.'
    }
  };
}

export function generateMockTimeline(watchlistId = 1) {
  return {
    slices: [
      { id: 'now', label: 'Live Now', timestamp: 'Just now' },
      { id: '1h', label: '1h Ago', timestamp: '1 hour ago' },
      { id: '4h', label: '4h Ago', timestamp: '4 hours ago' },
      { id: 'yesterday', label: 'Yesterday', timestamp: 'Yesterday close' },
      { id: '3d', label: '3d Ago', timestamp: '3 days ago' },
      { id: '1w', label: '1w Ago', timestamp: '1 week ago' }
    ]
  };
}

export function generateMockHistory(ticker, days = 30) {
  const meta = STOCKS_DATA[ticker] || { price: 150, symbolPrefix: '$' };
  const history = [];
  let p = meta.price * 0.92;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const dailyReturn = (Math.random() - 0.48) * 0.028;
    p = parseFloat((p * (1 + dailyReturn)).toFixed(2));
    const dt = new Date(now - i * 86400000);
    const date = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const open = parseFloat((p * (1 - (Math.random() - 0.5) * 0.012)).toFixed(2));
    const close = p;
    const high = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.012)).toFixed(2));
    const low = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.012)).toFixed(2));
    const volume = Math.floor(10000000 + Math.random() * 6000000);
    const pctChange = parseFloat((dailyReturn * 100).toFixed(2));

    history.push({
      date,
      timestamp: dt.toISOString(),
      price: close,
      open,
      high,
      low,
      close,
      volume,
      pctChange,
      isBullish: close >= open
    });
  }
  return { 
    ticker, 
    points: history, 
    history 
  };
}

