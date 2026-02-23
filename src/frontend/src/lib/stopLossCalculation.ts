// Stop-loss calculation utilities

export interface StopLossRecommendation {
  price: number;
  percentage: number;
  riskRewardRatios: {
    tp1: number;
    tp2: number;
    tp3: number;
  };
}

export interface StopLossParams {
  entryPrice: number;
  direction: 'long' | 'short';
  volatilityFactor?: number;
  supportResistanceZones?: number[];
  takeProfitPrices: { tp1: number; tp2: number; tp3: number };
}

export function calculateStopLoss(params: StopLossParams): StopLossRecommendation {
  const { entryPrice, direction, volatilityFactor = 1.0, supportResistanceZones, takeProfitPrices } = params;

  // Base stop-loss percentage adjusted by volatility
  // Low volatility: 1.5%, High volatility: 2.5%
  const basePercentage = volatilityFactor < 1 ? 0.015 : volatilityFactor > 1.2 ? 0.025 : 0.02;

  let slPrice: number;

  if (direction === 'long') {
    slPrice = entryPrice * (1 - basePercentage);

    // Adjust to nearest support zone if within 0.5%
    if (supportResistanceZones && supportResistanceZones.length > 0) {
      const nearestSupport = supportResistanceZones
        .filter((zone) => zone < entryPrice)
        .sort((a, b) => b - a)[0];

      if (nearestSupport) {
        const distancePercent = Math.abs((slPrice - nearestSupport) / slPrice);
        if (distancePercent < 0.005) {
          slPrice = nearestSupport;
        }
      }
    }
  } else {
    // Short position - SL above entry
    slPrice = entryPrice * (1 + basePercentage);

    // Adjust to nearest resistance zone if within 0.5%
    if (supportResistanceZones && supportResistanceZones.length > 0) {
      const nearestResistance = supportResistanceZones
        .filter((zone) => zone > entryPrice)
        .sort((a, b) => a - b)[0];

      if (nearestResistance) {
        const distancePercent = Math.abs((slPrice - nearestResistance) / slPrice);
        if (distancePercent < 0.005) {
          slPrice = nearestResistance;
        }
      }
    }
  }

  const slDistance = Math.abs(entryPrice - slPrice);
  const percentage = (slDistance / entryPrice) * 100;

  // Calculate risk-reward ratios
  const riskRewardRatios = {
    tp1: Math.abs(takeProfitPrices.tp1 - entryPrice) / slDistance,
    tp2: Math.abs(takeProfitPrices.tp2 - entryPrice) / slDistance,
    tp3: Math.abs(takeProfitPrices.tp3 - entryPrice) / slDistance,
  };

  return {
    price: slPrice,
    percentage,
    riskRewardRatios,
  };
}
