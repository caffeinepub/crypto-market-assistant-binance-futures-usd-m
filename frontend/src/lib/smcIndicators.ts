export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBlock {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  time: number;
  index: number;
  mitigated: boolean;
}

export interface FairValueGap {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  time: number;
  index: number;
  filled: boolean;
}

export interface StructurePoint {
  type: 'BOS' | 'CHoCH';
  direction: 'bullish' | 'bearish';
  price: number;
  time: number;
  index: number;
}

export interface LiquidityZone {
  type: 'swing_high' | 'swing_low' | 'equal_high' | 'equal_low';
  price: number;
  time: number;
  index: number;
  swept: boolean;
}

export interface PremiumDiscountZone {
  premiumHigh: number;
  premiumLow: number;
  discountHigh: number;
  discountLow: number;
  equilibrium: number;
  rangeHigh: number;
  rangeLow: number;
}

export interface SMCAnalysisResult {
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
  structurePoints: StructurePoint[];
  liquidityZones: LiquidityZone[];
  premiumDiscountZone: PremiumDiscountZone | null;
  bias: 'bullish' | 'bearish' | 'neutral';
  biasStrength: number;
}

function findSwingHighs(candles: Candle[], lookback = 3): number[] {
  const swings: number[] = [];
  for (let i = lookback; i < candles.length - lookback; i++) {
    let isSwing = true;
    for (let j = 1; j <= lookback; j++) {
      if (candles[i].high <= candles[i - j].high || candles[i].high <= candles[i + j].high) {
        isSwing = false;
        break;
      }
    }
    if (isSwing) swings.push(i);
  }
  return swings;
}

function findSwingLows(candles: Candle[], lookback = 3): number[] {
  const swings: number[] = [];
  for (let i = lookback; i < candles.length - lookback; i++) {
    let isSwing = true;
    for (let j = 1; j <= lookback; j++) {
      if (candles[i].low >= candles[i - j].low || candles[i].low >= candles[i + j].low) {
        isSwing = false;
        break;
      }
    }
    if (isSwing) swings.push(i);
  }
  return swings;
}

export function detectOrderBlocks(candles: Candle[], lookback = 5): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];
  if (candles.length < lookback + 3) return orderBlocks;

  for (let i = lookback; i < candles.length - 2; i++) {
    const candle = candles[i];
    const bodySize = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    if (totalRange === 0) continue;
    const bodyRatio = bodySize / totalRange;

    // Bearish Order Block: strong bearish candle followed by bullish move
    if (candle.close < candle.open && bodyRatio > 0.5) {
      let bullishMove = false;
      for (let j = i + 1; j < Math.min(i + 4, candles.length); j++) {
        if (candles[j].close > candle.high) {
          bullishMove = true;
          break;
        }
      }
      if (bullishMove) {
        const mitigated = candles.slice(i + 1).some(c => c.low <= candle.low && c.high >= candle.high);
        orderBlocks.push({
          type: 'bearish',
          high: candle.high,
          low: candle.open,
          time: candle.time,
          index: i,
          mitigated,
        });
      }
    }

    // Bullish Order Block: strong bullish candle followed by bearish move
    if (candle.close > candle.open && bodyRatio > 0.5) {
      let bearishMove = false;
      for (let j = i + 1; j < Math.min(i + 4, candles.length); j++) {
        if (candles[j].close < candle.low) {
          bearishMove = true;
          break;
        }
      }
      if (bearishMove) {
        const mitigated = candles.slice(i + 1).some(c => c.low <= candle.low && c.high >= candle.high);
        orderBlocks.push({
          type: 'bullish',
          high: candle.close,
          low: candle.low,
          time: candle.time,
          index: i,
          mitigated,
        });
      }
    }
  }

  return orderBlocks.slice(-20);
}

export function detectFairValueGaps(candles: Candle[]): FairValueGap[] {
  const fvgs: FairValueGap[] = [];
  if (candles.length < 3) return fvgs;

  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];

    // Bullish FVG: gap between prev high and next low (price moved up fast)
    if (next.low > prev.high) {
      const filled = candles.slice(i + 2).some(c => c.low <= prev.high);
      fvgs.push({
        type: 'bullish',
        high: next.low,
        low: prev.high,
        time: curr.time,
        index: i,
        filled,
      });
    }

    // Bearish FVG: gap between prev low and next high (price moved down fast)
    if (next.high < prev.low) {
      const filled = candles.slice(i + 2).some(c => c.high >= prev.low);
      fvgs.push({
        type: 'bearish',
        high: prev.low,
        low: next.high,
        time: curr.time,
        index: i,
        filled,
      });
    }
  }

  return fvgs.slice(-15);
}

export function detectStructurePoints(candles: Candle[]): StructurePoint[] {
  const points: StructurePoint[] = [];
  if (candles.length < 10) return points;

  const swingHighs = findSwingHighs(candles, 3);
  const swingLows = findSwingLows(candles, 3);

  // Detect BOS (Break of Structure) - continuation
  for (let i = 1; i < swingHighs.length; i++) {
    const prev = swingHighs[i - 1];
    const curr = swingHighs[i];
    if (candles[curr].high > candles[prev].high) {
      points.push({
        type: 'BOS',
        direction: 'bullish',
        price: candles[curr].high,
        time: candles[curr].time,
        index: curr,
      });
    }
  }

  for (let i = 1; i < swingLows.length; i++) {
    const prev = swingLows[i - 1];
    const curr = swingLows[i];
    if (candles[curr].low < candles[prev].low) {
      points.push({
        type: 'BOS',
        direction: 'bearish',
        price: candles[curr].low,
        time: candles[curr].time,
        index: curr,
      });
    }
  }

  // Detect CHoCH (Change of Character) - reversal
  for (let i = 1; i < swingHighs.length; i++) {
    const prevHigh = swingHighs[i - 1];
    const currHigh = swingHighs[i];
    // Find swing low between these two highs
    const lowBetween = swingLows.find(l => l > prevHigh && l < currHigh);
    if (lowBetween !== undefined) {
      // If current high is lower than previous high after a lower low, it's CHoCH bearish
      if (candles[currHigh].high < candles[prevHigh].high) {
        points.push({
          type: 'CHoCH',
          direction: 'bearish',
          price: candles[currHigh].high,
          time: candles[currHigh].time,
          index: currHigh,
        });
      }
    }
  }

  for (let i = 1; i < swingLows.length; i++) {
    const prevLow = swingLows[i - 1];
    const currLow = swingLows[i];
    const highBetween = swingHighs.find(h => h > prevLow && h < currLow);
    if (highBetween !== undefined) {
      if (candles[currLow].low > candles[prevLow].low) {
        points.push({
          type: 'CHoCH',
          direction: 'bullish',
          price: candles[currLow].low,
          time: candles[currLow].time,
          index: currLow,
        });
      }
    }
  }

  // Sort by index and return last 20
  return points.sort((a, b) => a.index - b.index).slice(-20);
}

export function detectLiquidityZones(candles: Candle[]): LiquidityZone[] {
  const zones: LiquidityZone[] = [];
  if (candles.length < 10) return zones;

  const swingHighIndices = findSwingHighs(candles, 3);
  const swingLowIndices = findSwingLows(candles, 3);

  // Add swing highs and lows
  for (const idx of swingHighIndices.slice(-10)) {
    const swept = candles.slice(idx + 1).some(c => c.high > candles[idx].high);
    zones.push({
      type: 'swing_high',
      price: candles[idx].high,
      time: candles[idx].time,
      index: idx,
      swept,
    });
  }

  for (const idx of swingLowIndices.slice(-10)) {
    const swept = candles.slice(idx + 1).some(c => c.low < candles[idx].low);
    zones.push({
      type: 'swing_low',
      price: candles[idx].low,
      time: candles[idx].time,
      index: idx,
      swept,
    });
  }

  // Detect equal highs (within 0.1% tolerance)
  for (let i = 0; i < swingHighIndices.length - 1; i++) {
    for (let j = i + 1; j < swingHighIndices.length; j++) {
      const h1 = candles[swingHighIndices[i]].high;
      const h2 = candles[swingHighIndices[j]].high;
      if (Math.abs(h1 - h2) / h1 < 0.001) {
        const swept = candles.slice(swingHighIndices[j] + 1).some(c => c.high > h2);
        zones.push({
          type: 'equal_high',
          price: (h1 + h2) / 2,
          time: candles[swingHighIndices[j]].time,
          index: swingHighIndices[j],
          swept,
        });
      }
    }
  }

  // Detect equal lows
  for (let i = 0; i < swingLowIndices.length - 1; i++) {
    for (let j = i + 1; j < swingLowIndices.length; j++) {
      const l1 = candles[swingLowIndices[i]].low;
      const l2 = candles[swingLowIndices[j]].low;
      if (Math.abs(l1 - l2) / l1 < 0.001) {
        const swept = candles.slice(swingLowIndices[j] + 1).some(c => c.low < l2);
        zones.push({
          type: 'equal_low',
          price: (l1 + l2) / 2,
          time: candles[swingLowIndices[j]].time,
          index: swingLowIndices[j],
          swept,
        });
      }
    }
  }

  return zones.slice(-20);
}

export function detectPremiumDiscountZone(candles: Candle[]): PremiumDiscountZone | null {
  if (candles.length < 20) return null;

  const recent = candles.slice(-50);
  const rangeHigh = Math.max(...recent.map(c => c.high));
  const rangeLow = Math.min(...recent.map(c => c.low));
  const range = rangeHigh - rangeLow;

  if (range === 0) return null;

  const equilibrium = rangeLow + range * 0.5;
  const premiumLow = rangeLow + range * 0.618;
  const discountHigh = rangeLow + range * 0.382;

  return {
    rangeHigh,
    rangeLow,
    equilibrium,
    premiumHigh: rangeHigh,
    premiumLow,
    discountHigh,
    discountLow: rangeLow,
  };
}

export function analyzeSMC(candles: Candle[]): SMCAnalysisResult {
  if (candles.length < 20) {
    return {
      orderBlocks: [],
      fairValueGaps: [],
      structurePoints: [],
      liquidityZones: [],
      premiumDiscountZone: null,
      bias: 'neutral',
      biasStrength: 0,
    };
  }

  const orderBlocks = detectOrderBlocks(candles);
  const fairValueGaps = detectFairValueGaps(candles);
  const structurePoints = detectStructurePoints(candles);
  const liquidityZones = detectLiquidityZones(candles);
  const premiumDiscountZone = detectPremiumDiscountZone(candles);

  // Calculate bias
  let bullishScore = 0;
  let bearishScore = 0;

  // Structure points bias
  const recentStructure = structurePoints.slice(-5);
  for (const sp of recentStructure) {
    if (sp.direction === 'bullish') bullishScore += sp.type === 'BOS' ? 2 : 3;
    else bearishScore += sp.type === 'BOS' ? 2 : 3;
  }

  // Order blocks bias
  const recentOBs = orderBlocks.filter(ob => !ob.mitigated).slice(-5);
  for (const ob of recentOBs) {
    if (ob.type === 'bullish') bullishScore += 1;
    else bearishScore += 1;
  }

  // FVG bias
  const recentFVGs = fairValueGaps.filter(fvg => !fvg.filled).slice(-5);
  for (const fvg of recentFVGs) {
    if (fvg.type === 'bullish') bullishScore += 1;
    else bearishScore += 1;
  }

  // Premium/Discount zone
  if (premiumDiscountZone) {
    const currentPrice = candles[candles.length - 1].close;
    if (currentPrice < premiumDiscountZone.discountHigh) bullishScore += 2;
    else if (currentPrice > premiumDiscountZone.premiumLow) bearishScore += 2;
  }

  const total = bullishScore + bearishScore;
  let bias: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  let biasStrength = 0;

  if (total > 0) {
    if (bullishScore > bearishScore) {
      bias = 'bullish';
      biasStrength = Math.round((bullishScore / total) * 100);
    } else if (bearishScore > bullishScore) {
      bias = 'bearish';
      biasStrength = Math.round((bearishScore / total) * 100);
    } else {
      bias = 'neutral';
      biasStrength = 50;
    }
  }

  return {
    orderBlocks,
    fairValueGaps,
    structurePoints,
    liquidityZones,
    premiumDiscountZone,
    bias,
    biasStrength,
  };
}
