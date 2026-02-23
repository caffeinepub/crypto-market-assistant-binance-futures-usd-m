// Take-profit zone calculation utilities

export interface TakeProfitZone {
  level: 'TP1' | 'TP2' | 'TP3';
  price: number;
  percentageGain: number;
}

export interface TakeProfitParams {
  entryPrice: number;
  direction: 'long' | 'short';
  volatilityFactor?: number; // ATR-based adjustment (default 1.0)
}

export function calculateTakeProfitZones(params: TakeProfitParams): TakeProfitZone[] {
  const { entryPrice, direction, volatilityFactor = 1.0 } = params;

  // Base percentages adjusted by volatility
  const basePercentages = {
    tp1: 0.015 * volatilityFactor, // 1.5%
    tp2: 0.04 * volatilityFactor,  // 4%
    tp3: 0.075 * volatilityFactor, // 7.5%
  };

  const zones: TakeProfitZone[] = [];

  if (direction === 'long') {
    zones.push({
      level: 'TP1',
      price: entryPrice * (1 + basePercentages.tp1),
      percentageGain: basePercentages.tp1 * 100,
    });
    zones.push({
      level: 'TP2',
      price: entryPrice * (1 + basePercentages.tp2),
      percentageGain: basePercentages.tp2 * 100,
    });
    zones.push({
      level: 'TP3',
      price: entryPrice * (1 + basePercentages.tp3),
      percentageGain: basePercentages.tp3 * 100,
    });
  } else {
    // Short positions - TPs are below entry
    zones.push({
      level: 'TP1',
      price: entryPrice * (1 - basePercentages.tp1),
      percentageGain: basePercentages.tp1 * 100,
    });
    zones.push({
      level: 'TP2',
      price: entryPrice * (1 - basePercentages.tp2),
      percentageGain: basePercentages.tp2 * 100,
    });
    zones.push({
      level: 'TP3',
      price: entryPrice * (1 - basePercentages.tp3),
      percentageGain: basePercentages.tp3 * 100,
    });
  }

  return zones;
}

export function getVolatilityFactor(atr?: number, currentPrice?: number): number {
  if (!atr || !currentPrice || currentPrice === 0) return 1.0;

  // ATR as percentage of price
  const atrPercent = (atr / currentPrice) * 100;

  // Adjust factor based on ATR percentage
  // Low volatility (< 1%): factor 0.8
  // Normal volatility (1-3%): factor 1.0
  // High volatility (> 3%): factor 1.3
  if (atrPercent < 1) return 0.8;
  if (atrPercent > 3) return 1.3;
  return 1.0;
}
