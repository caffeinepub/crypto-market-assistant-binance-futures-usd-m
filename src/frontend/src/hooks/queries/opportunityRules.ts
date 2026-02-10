import { BinanceMarketData } from '../useQueries';

export interface OpportunityItem {
  symbol: string;
  lastPrice: string;
  priceChangePercent: number;
  strength: number;
  confidence: number;
  reasons: string[];
  score: number;
}

/**
 * Deterministic scoring and sorting helper
 * Ensures stable ordering by using symbol as tie-breaker
 */
function sortByScoreAndSymbol(opportunities: OpportunityItem[]): OpportunityItem[] {
  return opportunities.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.symbol.localeCompare(b.symbol);
  });
}

/**
 * Scalping: High volume, low volatility, frequent trades
 * Focus: Quick entries/exits on small price movements
 */
export function selectScalpingOpportunities(marketData: BinanceMarketData[]): OpportunityItem[] {
  const opportunities: OpportunityItem[] = [];

  for (const asset of marketData) {
    const reasons: string[] = [];
    let score = 0;

    const volume = parseFloat(asset.quoteVolume);
    const priceChange = Math.abs(asset.priceChangePercent);
    const tradeCount = asset.count;
    const high = parseFloat(asset.highPrice);
    const low = parseFloat(asset.lowPrice);
    const price = parseFloat(asset.lastPrice);
    const volatility = (high - low) / price;

    // High volume (institutional interest)
    if (volume > 5_000_000_000) {
      reasons.push('High volume');
      score += 30;
    } else if (volume > 2_000_000_000) {
      reasons.push('Good volume');
      score += 15;
    }

    // Low to moderate volatility (predictable moves)
    if (volatility < 0.02) {
      reasons.push('Low volatility');
      score += 25;
    } else if (volatility < 0.04) {
      reasons.push('Moderate volatility');
      score += 10;
    }

    // High trade frequency
    if (tradeCount > 100_000) {
      reasons.push('High trade frequency');
      score += 20;
    } else if (tradeCount > 50_000) {
      reasons.push('Good trade frequency');
      score += 10;
    }

    // Small price movements (scalping range)
    if (priceChange < 1.5 && priceChange > 0.2) {
      reasons.push('Ideal scalping range');
      score += 25;
    }

    // Minimum criteria: at least 2 conditions met
    if (reasons.length >= 2) {
      opportunities.push({
        symbol: asset.symbol,
        lastPrice: asset.lastPrice,
        priceChangePercent: asset.priceChangePercent,
        strength: asset.analysis.strength,
        confidence: asset.analysis.confidence,
        reasons,
        score,
      });
    }
  }

  return sortByScoreAndSymbol(opportunities).slice(0, 15);
}

/**
 * Swing: Medium-term trends, clear direction, sustained momentum
 * Focus: Capturing multi-day trend movements
 */
export function selectSwingOpportunities(marketData: BinanceMarketData[]): OpportunityItem[] {
  const opportunities: OpportunityItem[] = [];

  for (const asset of marketData) {
    const reasons: string[] = [];
    let score = 0;

    const priceChange = asset.priceChangePercent;
    const volume = parseFloat(asset.quoteVolume);
    const confidence = asset.analysis.confidence;
    const strength = asset.analysis.strength;

    // Strong directional move
    if (Math.abs(priceChange) > 3) {
      reasons.push(`Strong ${priceChange > 0 ? 'uptrend' : 'downtrend'}`);
      score += 30;
    } else if (Math.abs(priceChange) > 1.5) {
      reasons.push(`Moderate ${priceChange > 0 ? 'uptrend' : 'downtrend'}`);
      score += 15;
    }

    // High confidence from analysis
    if (confidence > 0.7) {
      reasons.push('High confidence signal');
      score += 25;
    } else if (confidence > 0.5) {
      reasons.push('Good confidence signal');
      score += 12;
    }

    // Strong momentum
    if (strength > 70) {
      reasons.push('Strong momentum');
      score += 25;
    } else if (strength > 50) {
      reasons.push('Good momentum');
      score += 12;
    }

    // Sustained volume
    if (volume > 3_000_000_000) {
      reasons.push('Sustained volume');
      score += 20;
    }

    // Minimum criteria: at least 2 conditions met
    if (reasons.length >= 2) {
      opportunities.push({
        symbol: asset.symbol,
        lastPrice: asset.lastPrice,
        priceChangePercent: asset.priceChangePercent,
        strength: asset.analysis.strength,
        confidence: asset.analysis.confidence,
        reasons,
        score,
      });
    }
  }

  return sortByScoreAndSymbol(opportunities).slice(0, 15);
}

/**
 * Breakout: Assets breaking key levels with volume confirmation
 * Focus: Momentum continuation after resistance/support breaks
 */
export function selectBreakoutOpportunities(marketData: BinanceMarketData[]): OpportunityItem[] {
  const opportunities: OpportunityItem[] = [];

  for (const asset of marketData) {
    const reasons: string[] = [];
    let score = 0;

    const priceChange = asset.priceChangePercent;
    const volume = parseFloat(asset.quoteVolume);
    const high = parseFloat(asset.highPrice);
    const low = parseFloat(asset.lowPrice);
    const open = parseFloat(asset.openPrice);
    const price = parseFloat(asset.lastPrice);
    const range = high - low;

    // Strong breakout move
    if (Math.abs(priceChange) > 4) {
      reasons.push('Strong breakout move');
      score += 35;
    } else if (Math.abs(priceChange) > 2.5) {
      reasons.push('Moderate breakout move');
      score += 20;
    }

    // Volume surge (breakout confirmation)
    if (volume > 8_000_000_000) {
      reasons.push('Volume surge');
      score += 30;
    } else if (volume > 5_000_000_000) {
      reasons.push('High volume');
      score += 15;
    }

    // Price near high/low (breakout continuation)
    const distanceFromHigh = (high - price) / range;
    const distanceFromLow = (price - low) / range;
    
    if (priceChange > 0 && distanceFromHigh < 0.15) {
      reasons.push('Near 24h high');
      score += 25;
    } else if (priceChange < 0 && distanceFromLow < 0.15) {
      reasons.push('Near 24h low');
      score += 25;
    }

    // Wide range (volatility expansion)
    const volatility = range / price;
    if (volatility > 0.05) {
      reasons.push('High volatility expansion');
      score += 20;
    }

    // Minimum criteria: at least 2 conditions met
    if (reasons.length >= 2) {
      opportunities.push({
        symbol: asset.symbol,
        lastPrice: asset.lastPrice,
        priceChangePercent: asset.priceChangePercent,
        strength: asset.analysis.strength,
        confidence: asset.analysis.confidence,
        reasons,
        score,
      });
    }
  }

  return sortByScoreAndSymbol(opportunities).slice(0, 15);
}

/**
 * Reversal: Potential trend reversals at key zones
 * Focus: Counter-trend entries at exhaustion points
 */
export function selectReversalOpportunities(marketData: BinanceMarketData[]): OpportunityItem[] {
  const opportunities: OpportunityItem[] = [];

  for (const asset of marketData) {
    const reasons: string[] = [];
    let score = 0;

    const priceChange = asset.priceChangePercent;
    const high = parseFloat(asset.highPrice);
    const low = parseFloat(asset.lowPrice);
    const open = parseFloat(asset.openPrice);
    const price = parseFloat(asset.lastPrice);
    const volume = parseFloat(asset.quoteVolume);
    const range = high - low;

    // Extreme move (potential exhaustion)
    if (Math.abs(priceChange) > 5) {
      reasons.push('Extreme move - potential exhaustion');
      score += 30;
    } else if (Math.abs(priceChange) > 3) {
      reasons.push('Strong move - watch for reversal');
      score += 15;
    }

    // Price rejection from extremes
    const distanceFromHigh = (high - price) / range;
    const distanceFromLow = (price - low) / range;
    
    if (priceChange > 0 && distanceFromHigh > 0.5) {
      reasons.push('Rejection from high');
      score += 25;
    } else if (priceChange < 0 && distanceFromLow > 0.5) {
      reasons.push('Rejection from low');
      score += 25;
    }

    // Volume divergence (high volume but price not following)
    if (volume > 6_000_000_000 && Math.abs(priceChange) < 2) {
      reasons.push('Volume divergence');
      score += 25;
    }

    // Manipulation zones detected
    if (asset.analysis.manipulationZones.length > 0) {
      reasons.push('Manipulation zone detected');
      score += 20;
    }

    // Institutional orders (potential reversal setup)
    if (asset.analysis.institutionalOrders.length > 0) {
      const order = asset.analysis.institutionalOrders[0];
      const isCounterTrend = (priceChange > 0 && order.direction === 'down') || (priceChange < 0 && order.direction === 'up');
      if (isCounterTrend) {
        reasons.push('Counter-trend institutional order');
        score += 25;
      }
    }

    // Minimum criteria: at least 2 conditions met
    if (reasons.length >= 2) {
      opportunities.push({
        symbol: asset.symbol,
        lastPrice: asset.lastPrice,
        priceChangePercent: asset.priceChangePercent,
        strength: asset.analysis.strength,
        confidence: asset.analysis.confidence,
        reasons,
        score,
      });
    }
  }

  return sortByScoreAndSymbol(opportunities).slice(0, 15);
}

/**
 * SMC (Smart Money Concepts): Institutional order flow detection
 * Focus: Following institutional money movements
 */
export function selectSMCOpportunities(marketData: BinanceMarketData[]): OpportunityItem[] {
  const opportunities: OpportunityItem[] = [];

  for (const asset of marketData) {
    const reasons: string[] = [];
    let score = 0;

    const volume = parseFloat(asset.quoteVolume);
    const priceChange = asset.priceChangePercent;
    const institutionalOrders = asset.analysis.institutionalOrders;
    const manipulationZones = asset.analysis.manipulationZones;

    // Institutional orders detected
    if (institutionalOrders.length > 0) {
      const order = institutionalOrders[0];
      reasons.push(`Institutional ${order.direction === 'up' ? 'buying' : 'selling'} detected`);
      score += order.confidence * 40;
    }

    // Manipulation zones (liquidity grabs)
    if (manipulationZones.length > 0) {
      const zone = manipulationZones[0];
      reasons.push('Liquidity zone identified');
      score += zone.confidence * 30;
    }

    // High volume with minimal price movement (accumulation/distribution)
    if (volume > 8_000_000_000 && Math.abs(priceChange) < 1.5) {
      reasons.push('Accumulation/distribution pattern');
      score += 25;
    }

    // Order blocks (strong support/resistance with volume)
    if (volume > 5_000_000_000 && Math.abs(priceChange) > 3) {
      reasons.push('Order block formation');
      score += 20;
    }

    // High confidence from analysis
    if (asset.analysis.confidence > 0.65) {
      reasons.push('High analysis confidence');
      score += 15;
    }

    // Minimum criteria: at least institutional signal or manipulation zone
    if (institutionalOrders.length > 0 || manipulationZones.length > 0) {
      opportunities.push({
        symbol: asset.symbol,
        lastPrice: asset.lastPrice,
        priceChangePercent: asset.priceChangePercent,
        strength: asset.analysis.strength,
        confidence: asset.analysis.confidence,
        reasons,
        score,
      });
    }
  }

  return sortByScoreAndSymbol(opportunities).slice(0, 15);
}

/**
 * FVG (Fair Value Gaps): Imbalance zones for potential fills
 * Focus: Price inefficiencies and gap-fill opportunities
 */
export function selectFVGOpportunities(marketData: BinanceMarketData[]): OpportunityItem[] {
  const opportunities: OpportunityItem[] = [];

  for (const asset of marketData) {
    const reasons: string[] = [];
    let score = 0;

    const high = parseFloat(asset.highPrice);
    const low = parseFloat(asset.lowPrice);
    const open = parseFloat(asset.openPrice);
    const price = parseFloat(asset.lastPrice);
    const priceChange = asset.priceChangePercent;
    const volume = parseFloat(asset.quoteVolume);
    const range = high - low;
    const volatility = range / price;

    // Large price gap (imbalance)
    if (volatility > 0.06) {
      reasons.push('Large price imbalance');
      score += 35;
    } else if (volatility > 0.04) {
      reasons.push('Moderate price imbalance');
      score += 20;
    }

    // Fast move creating gap
    if (Math.abs(priceChange) > 4) {
      reasons.push('Fast move - gap created');
      score += 30;
    } else if (Math.abs(priceChange) > 2.5) {
      reasons.push('Quick move - potential gap');
      score += 15;
    }

    // Low volume in gap area (inefficiency)
    const avgTradeSize = volume / asset.count;
    if (avgTradeSize > 50_000 && volatility > 0.03) {
      reasons.push('Low liquidity gap');
      score += 25;
    }

    // Price away from open (gap from session start)
    const gapFromOpen = Math.abs((price - open) / open);
    if (gapFromOpen > 0.03) {
      reasons.push('Gap from session open');
      score += 20;
    }

    // Support/resistance zones (potential fill targets)
    const hasZones = asset.analysis.supportZones.length > 0 || asset.analysis.resistanceZones.length > 0;
    if (hasZones && volatility > 0.03) {
      reasons.push('Key zones for gap fill');
      score += 15;
    }

    // Minimum criteria: at least 2 conditions met
    if (reasons.length >= 2) {
      opportunities.push({
        symbol: asset.symbol,
        lastPrice: asset.lastPrice,
        priceChangePercent: asset.priceChangePercent,
        strength: asset.analysis.strength,
        confidence: asset.analysis.confidence,
        reasons,
        score,
      });
    }
  }

  return sortByScoreAndSymbol(opportunities).slice(0, 15);
}
