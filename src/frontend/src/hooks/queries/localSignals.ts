import { BinanceMarketData, Recommendation, RadarAlert } from '../useQueries';

/**
 * Generate recommendations from market data based on bullish trends with high confidence
 */
export function generateRecommendations(marketData: BinanceMarketData[]): Recommendation[] {
  const topBullish = marketData
    .filter((m) => m.analysis.trend === 'bullish' && m.analysis.strength > 50 && m.analysis.confidence > 0.4)
    .sort((a, b) => {
      // Prioritize by learning level, then confidence, then strength
      const learningDiff = (b.analysis.learningLevel || 0) - (a.analysis.learningLevel || 0);
      if (Math.abs(learningDiff) > 0.1) return learningDiff;
      
      const confDiff = b.analysis.confidence - a.analysis.confidence;
      if (Math.abs(confDiff) > 0.1) return confDiff;
      
      return b.analysis.strength - a.analysis.strength;
    })
    .slice(0, 15)
    .map((market) => ({
      symbol: market.symbol,
      strength: market.analysis.strength,
      confidence: market.analysis.confidence,
      timestamp: Date.now(),
    }));

  return topBullish;
}

/**
 * Generate radar alerts from market data based on price and volume anomalies
 */
export function generateRadarAlerts(marketData: BinanceMarketData[]): RadarAlert[] {
  const alerts: RadarAlert[] = [];
  const avgVolume = 5000000000; // Baseline average volume

  marketData.forEach((market) => {
    const percentChange = market.priceChangePercent;
    const volume = parseFloat(market.quoteVolume);
    const volumeRatio = volume / avgVolume;

    // Detect anomalies
    const isPriceAnomaly = Math.abs(percentChange) > 3;
    const isVolumeAnomaly = volumeRatio > 1.5;

    if (isPriceAnomaly || isVolumeAnomaly) {
      const confidence = Math.min(
        (Math.abs(percentChange) / 10 + (volumeRatio - 1) / 2) / 2,
        1.0
      );

      alerts.push({
        symbol: market.symbol,
        percentChange,
        volumeDelta: volumeRatio,
        direction: percentChange >= 0 ? 'up' : 'down',
        confidence,
        timestamp: Date.now(),
      });
    }
  });

  return alerts;
}
