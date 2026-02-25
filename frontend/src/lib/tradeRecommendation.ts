import { BinanceMarketData } from '@/hooks/useQueries';

export type TradeDirection = 'Long' | 'Short';

export interface TradeRecommendation {
  direction: TradeDirection;
  entry: number;
  takeProfit: number;
  stopLoss: number;
  rationale: string[];
  confidence: number;
  riskRewardRatio: number;
}

export interface RecommendationError {
  reason: string;
  missingData: string[];
}

export type RecommendationResult =
  | { success: true; recommendation: TradeRecommendation }
  | { success: false; error: RecommendationError };

/**
 * Modality-specific risk/reward parameters
 * All calculations use only frontend-fetched Binance data
 */
const MODALITY_PARAMS = {
  scalping: {
    riskPercent: 0.005, // 0.5% risk
    rewardRatio: 1.5, // 1:1.5 risk/reward
    entryOffset: 0.001, // 0.1% from current price
    atrMultiplier: 1.0, // Tight stops for scalping
  },
  swing: {
    riskPercent: 0.02, // 2% risk
    rewardRatio: 2.5, // 1:2.5 risk/reward
    entryOffset: 0.005, // 0.5% from current price
    atrMultiplier: 1.5,
  },
  breakout: {
    riskPercent: 0.015, // 1.5% risk
    rewardRatio: 3.0, // 1:3 risk/reward
    entryOffset: 0.002, // 0.2% from current price
    atrMultiplier: 1.2,
  },
  reversal: {
    riskPercent: 0.025, // 2.5% risk
    rewardRatio: 2.0, // 1:2 risk/reward
    entryOffset: 0.008, // 0.8% from current price
    atrMultiplier: 2.0, // Wider stops for reversals
  },
  smc: {
    riskPercent: 0.018, // 1.8% risk
    rewardRatio: 2.8, // 1:2.8 risk/reward
    entryOffset: 0.004, // 0.4% from current price
    atrMultiplier: 1.5,
  },
  fvg: {
    riskPercent: 0.012, // 1.2% risk
    rewardRatio: 2.2, // 1:2.2 risk/reward
    entryOffset: 0.003, // 0.3% from current price
    atrMultiplier: 1.3,
  },
};

type Modality = keyof typeof MODALITY_PARAMS;

/**
 * Compute trade recommendation based on modality and market data
 * Uses only frontend-fetched Binance data: price, volume, technical analysis
 * No backend HTTP calls are made
 */
export function computeTradeRecommendation(
  modality: string,
  marketData: BinanceMarketData
): RecommendationResult {
  const missingData: string[] = [];

  // Validate required data
  if (!marketData.lastPrice || marketData.lastPrice === '0') {
    missingData.push('current price');
  }
  if (!marketData.analysis) {
    missingData.push('technical analysis');
  }

  if (missingData.length > 0) {
    return {
      success: false,
      error: {
        reason: 'Insufficient data to compute recommendation',
        missingData,
      },
    };
  }

  const currentPrice = parseFloat(marketData.lastPrice);
  const highPrice = parseFloat(marketData.highPrice);
  const lowPrice = parseFloat(marketData.lowPrice);
  const analysis = marketData.analysis;
  const params = MODALITY_PARAMS[modality as Modality] || MODALITY_PARAMS.swing;

  // Calculate ATR-like volatility from high-low range
  const atr = highPrice - lowPrice;
  const atrPercent = atr / currentPrice;

  // Determine direction based on trend, momentum, and institutional signals
  const priceChangePercent = marketData.priceChangePercent;
  let isBullish = analysis.trend === 'bullish' || priceChangePercent > 0;

  // Check institutional order alignment
  if (analysis.institutionalOrders.length > 0) {
    const institutionalDirection = analysis.institutionalOrders[0].direction;
    if (institutionalDirection === 'up') {
      isBullish = true;
    } else if (institutionalDirection === 'down') {
      isBullish = false;
    }
  }

  const direction: TradeDirection = isBullish ? 'Long' : 'Short';

  // Build rationale from technical analysis data
  const rationale: string[] = [];
  rationale.push(`${analysis.trend === 'bullish' ? 'Bullish' : 'Bearish'} trend detected`);
  rationale.push(`Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
  rationale.push(`Strength: ${analysis.strength.toFixed(0)}/100`);

  // Calculate optimal entry price using support/resistance zones
  let entry: number;
  if (direction === 'Long') {
    // For long, look for entry near support or slightly below current price
    const nearestSupport = analysis.supportZones
      .filter((s) => s < currentPrice && s > currentPrice * 0.95)
      .sort((a, b) => b - a)[0];
    
    if (nearestSupport) {
      entry = nearestSupport * 1.002; // Enter slightly above support
      rationale.push(`Entry near support at $${nearestSupport.toFixed(2)}`);
    } else {
      entry = currentPrice * (1 - params.entryOffset);
      rationale.push(`Entry below current price`);
    }
  } else {
    // For short, look for entry near resistance or slightly above current price
    const nearestResistance = analysis.resistanceZones
      .filter((r) => r > currentPrice && r < currentPrice * 1.05)
      .sort((a, b) => a - b)[0];
    
    if (nearestResistance) {
      entry = nearestResistance * 0.998; // Enter slightly below resistance
      rationale.push(`Entry near resistance at $${nearestResistance.toFixed(2)}`);
    } else {
      entry = currentPrice * (1 + params.entryOffset);
      rationale.push(`Entry above current price`);
    }
  }

  // Calculate stop loss using ATR and support/resistance levels
  let stopLoss: number;
  if (direction === 'Long') {
    // Use ATR-based stop or nearest support, whichever is closer
    const atrStop = entry - (atr * params.atrMultiplier);
    const nearestSupport = analysis.supportZones
      .filter((s) => s < entry)
      .sort((a, b) => b - a)[0];
    
    if (nearestSupport && nearestSupport > atrStop && nearestSupport > entry * 0.9) {
      stopLoss = nearestSupport * 0.995; // 0.5% below support
      rationale.push(`Stop loss below support at $${nearestSupport.toFixed(2)}`);
    } else {
      stopLoss = Math.max(atrStop, entry * (1 - params.riskPercent));
      rationale.push(`Stop loss based on ${(params.atrMultiplier).toFixed(1)}x ATR`);
    }
  } else {
    // Use ATR-based stop or nearest resistance, whichever is closer
    const atrStop = entry + (atr * params.atrMultiplier);
    const nearestResistance = analysis.resistanceZones
      .filter((r) => r > entry)
      .sort((a, b) => a - b)[0];
    
    if (nearestResistance && nearestResistance < atrStop && nearestResistance < entry * 1.1) {
      stopLoss = nearestResistance * 1.005; // 0.5% above resistance
      rationale.push(`Stop loss above resistance at $${nearestResistance.toFixed(2)}`);
    } else {
      stopLoss = Math.min(atrStop, entry * (1 + params.riskPercent));
      rationale.push(`Stop loss based on ${(params.atrMultiplier).toFixed(1)}x ATR`);
    }
  }

  // Calculate take profit using risk/reward ratio and resistance/support targets
  const risk = Math.abs(entry - stopLoss);
  const baseReward = risk * params.rewardRatio;
  let takeProfit: number;

  if (direction === 'Long') {
    takeProfit = entry + baseReward;
    
    // Adjust TP based on nearest resistance and momentum
    const nearestResistance = analysis.resistanceZones
      .filter((r) => r > entry && r < takeProfit * 1.2)
      .sort((a, b) => a - b)[0];
    
    if (nearestResistance) {
      // If strong momentum (high strength), target just below resistance
      if (analysis.strength > 70) {
        takeProfit = Math.min(takeProfit, nearestResistance * 0.998);
        rationale.push(`TP targeting resistance at $${nearestResistance.toFixed(2)}`);
      } else {
        // Conservative: take profit before resistance
        takeProfit = Math.min(takeProfit, nearestResistance * 0.99);
        rationale.push(`TP before resistance at $${nearestResistance.toFixed(2)}`);
      }
    } else {
      rationale.push(`TP based on ${params.rewardRatio.toFixed(1)}:1 R/R ratio`);
    }
  } else {
    takeProfit = entry - baseReward;
    
    // Adjust TP based on nearest support and momentum
    const nearestSupport = analysis.supportZones
      .filter((s) => s < entry && s > takeProfit * 0.8)
      .sort((a, b) => b - a)[0];
    
    if (nearestSupport) {
      // If strong momentum (high strength), target just above support
      if (analysis.strength > 70) {
        takeProfit = Math.max(takeProfit, nearestSupport * 1.002);
        rationale.push(`TP targeting support at $${nearestSupport.toFixed(2)}`);
      } else {
        // Conservative: take profit before support
        takeProfit = Math.max(takeProfit, nearestSupport * 1.01);
        rationale.push(`TP before support at $${nearestSupport.toFixed(2)}`);
      }
    } else {
      rationale.push(`TP based on ${params.rewardRatio.toFixed(1)}:1 R/R ratio`);
    }
  }

  // Add institutional order flow context
  if (analysis.institutionalOrders.length > 0) {
    const order = analysis.institutionalOrders[0];
    if (
      (direction === 'Long' && order.direction === 'up') ||
      (direction === 'Short' && order.direction === 'down')
    ) {
      rationale.push(`Institutional flow aligned (${(order.confidence * 100).toFixed(0)}% confidence)`);
    }
  }

  // Add manipulation zone warning
  if (analysis.manipulationZones.length > 0) {
    rationale.push('Manipulation zone detected - exercise caution');
  }

  // Add modality-specific tags from analysis
  if (analysis.tags.length > 0) {
    const relevantTags = analysis.tags.slice(0, 2);
    rationale.push(...relevantTags);
  }

  // Calculate actual risk/reward ratio
  const actualRisk = Math.abs(entry - stopLoss);
  const actualReward = Math.abs(takeProfit - entry);
  const riskRewardRatio = actualReward / actualRisk;

  return {
    success: true,
    recommendation: {
      direction,
      entry,
      takeProfit,
      stopLoss,
      rationale,
      confidence: analysis.confidence,
      riskRewardRatio,
    },
  };
}
