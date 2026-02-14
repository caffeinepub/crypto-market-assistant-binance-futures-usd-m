import { BinanceMarketData } from '@/hooks/useQueries';

export type TradeDirection = 'Long' | 'Short';

export interface TradeRecommendation {
  direction: TradeDirection;
  entry: number;
  takeProfit: number;
  stopLoss: number;
  rationale: string[];
  confidence: number;
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
 */
const MODALITY_PARAMS = {
  scalping: {
    riskPercent: 0.005, // 0.5% risk
    rewardRatio: 1.5, // 1:1.5 risk/reward
    entryOffset: 0.001, // 0.1% from current price
  },
  swing: {
    riskPercent: 0.02, // 2% risk
    rewardRatio: 2.5, // 1:2.5 risk/reward
    entryOffset: 0.005, // 0.5% from current price
  },
  breakout: {
    riskPercent: 0.015, // 1.5% risk
    rewardRatio: 3.0, // 1:3 risk/reward
    entryOffset: 0.002, // 0.2% from current price
  },
  reversal: {
    riskPercent: 0.025, // 2.5% risk
    rewardRatio: 2.0, // 1:2 risk/reward
    entryOffset: 0.008, // 0.8% from current price
  },
  smc: {
    riskPercent: 0.018, // 1.8% risk
    rewardRatio: 2.8, // 1:2.8 risk/reward
    entryOffset: 0.004, // 0.4% from current price
  },
  fvg: {
    riskPercent: 0.012, // 1.2% risk
    rewardRatio: 2.2, // 1:2.2 risk/reward
    entryOffset: 0.003, // 0.3% from current price
  },
};

type Modality = keyof typeof MODALITY_PARAMS;

/**
 * Compute trade recommendation based on modality and market data
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
  const analysis = marketData.analysis;
  const params = MODALITY_PARAMS[modality as Modality] || MODALITY_PARAMS.swing;

  // Determine direction based on trend and price action
  const priceChangePercent = marketData.priceChangePercent;
  const isBullish = analysis.trend === 'bullish' || priceChangePercent > 0;
  const direction: TradeDirection = isBullish ? 'Long' : 'Short';

  // Build rationale
  const rationale: string[] = [];
  rationale.push(`${analysis.trend === 'bullish' ? 'Bullish' : 'Bearish'} trend detected`);
  rationale.push(`Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
  rationale.push(`Strength: ${analysis.strength.toFixed(0)}/100`);

  // Add support/resistance context
  if (direction === 'Long' && analysis.supportZones.length > 0) {
    const nearestSupport = analysis.supportZones
      .filter((s) => s < currentPrice)
      .sort((a, b) => b - a)[0];
    if (nearestSupport) {
      rationale.push(`Support at $${nearestSupport.toFixed(2)}`);
    }
  } else if (direction === 'Short' && analysis.resistanceZones.length > 0) {
    const nearestResistance = analysis.resistanceZones
      .filter((r) => r > currentPrice)
      .sort((a, b) => a - b)[0];
    if (nearestResistance) {
      rationale.push(`Resistance at $${nearestResistance.toFixed(2)}`);
    }
  }

  // Add institutional/manipulation signals
  if (analysis.institutionalOrders.length > 0) {
    const order = analysis.institutionalOrders[0];
    if (
      (direction === 'Long' && order.direction === 'up') ||
      (direction === 'Short' && order.direction === 'down')
    ) {
      rationale.push('Institutional order flow aligned');
    }
  }

  if (analysis.manipulationZones.length > 0) {
    rationale.push('Manipulation zone detected');
  }

  // Add modality-specific tags
  if (analysis.tags.length > 0) {
    const relevantTags = analysis.tags.slice(0, 2);
    rationale.push(...relevantTags);
  }

  // Calculate entry with modality-specific offset
  let entry: number;
  if (direction === 'Long') {
    // For long, enter slightly below current price
    entry = currentPrice * (1 - params.entryOffset);
  } else {
    // For short, enter slightly above current price
    entry = currentPrice * (1 + params.entryOffset);
  }

  // Calculate stop loss based on modality risk
  let stopLoss: number;
  if (direction === 'Long') {
    // Use nearest support if available, otherwise use risk percent
    const nearestSupport = analysis.supportZones
      .filter((s) => s < entry)
      .sort((a, b) => b - a)[0];
    if (nearestSupport && nearestSupport > entry * (1 - params.riskPercent * 2)) {
      stopLoss = nearestSupport * 0.995; // 0.5% below support
    } else {
      stopLoss = entry * (1 - params.riskPercent);
    }
  } else {
    // Use nearest resistance if available, otherwise use risk percent
    const nearestResistance = analysis.resistanceZones
      .filter((r) => r > entry)
      .sort((a, b) => a - b)[0];
    if (nearestResistance && nearestResistance < entry * (1 + params.riskPercent * 2)) {
      stopLoss = nearestResistance * 1.005; // 0.5% above resistance
    } else {
      stopLoss = entry * (1 + params.riskPercent);
    }
  }

  // Calculate take profit based on risk/reward ratio
  const risk = Math.abs(entry - stopLoss);
  const reward = risk * params.rewardRatio;
  let takeProfit: number;
  if (direction === 'Long') {
    takeProfit = entry + reward;
    // Cap at nearest resistance if available
    const nearestResistance = analysis.resistanceZones
      .filter((r) => r > entry && r < takeProfit * 1.1)
      .sort((a, b) => a - b)[0];
    if (nearestResistance) {
      takeProfit = Math.min(takeProfit, nearestResistance * 0.995);
    }
  } else {
    takeProfit = entry - reward;
    // Cap at nearest support if available
    const nearestSupport = analysis.supportZones
      .filter((s) => s < entry && s > takeProfit * 0.9)
      .sort((a, b) => b - a)[0];
    if (nearestSupport) {
      takeProfit = Math.max(takeProfit, nearestSupport * 1.005);
    }
  }

  return {
    success: true,
    recommendation: {
      direction,
      entry,
      takeProfit,
      stopLoss,
      rationale,
      confidence: analysis.confidence,
    },
  };
}
