import type { BinanceMarketData, Recommendation } from "../useQueries";

/**
 * Generate recommendations from market data based on bullish trends with high confidence
 */
export function generateRecommendations(
  marketData: BinanceMarketData[],
): Recommendation[] {
  const topBullish = marketData
    .filter(
      (m) =>
        m.analysis.trend === "bullish" &&
        m.analysis.strength > 50 &&
        m.analysis.confidence > 0.4,
    )
    .sort((a, b) => {
      // Prioritize by learning level, then confidence, then strength
      const learningDiff =
        (b.analysis.learningLevel || 0) - (a.analysis.learningLevel || 0);
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
