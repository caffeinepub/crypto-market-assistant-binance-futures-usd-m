import { BinanceMarketData } from '../useQueries';
import { learningEngine } from '@/lib/learningEngine';

export interface LearningPrioritization {
  enabled: boolean;
  favouriteSymbols: string[];
}

/**
 * Record predictions for continuous learning
 * Optionally prioritizes favourite assets when enabled
 */
export async function recordPredictions(
  marketData: BinanceMarketData[],
  prioritization?: LearningPrioritization
): Promise<void> {
  try {
    await learningEngine.initialize();
    const config = await learningEngine.getConfig();
    
    if (!config.enabled) return;

    // Sort market data to prioritize favourites if enabled
    let sortedMarketData = [...marketData];
    if (prioritization?.enabled && prioritization.favouriteSymbols.length > 0) {
      sortedMarketData = sortedMarketData.sort((a, b) => {
        const aIsFavourite = prioritization.favouriteSymbols.includes(a.symbol);
        const bIsFavourite = prioritization.favouriteSymbols.includes(b.symbol);
        
        // Favourites come first
        if (aIsFavourite && !bIsFavourite) return -1;
        if (!aIsFavourite && bIsFavourite) return 1;
        return 0;
      });
    }

    for (const market of sortedMarketData) {
      const isFavourite = prioritization?.enabled && 
                         prioritization.favouriteSymbols.includes(market.symbol);
      
      // Apply more aggressive recording for favourites
      const effectiveConfidenceThreshold = isFavourite 
        ? config.confidenceThreshold * 0.8  // Lower threshold for favourites (record more)
        : config.confidenceThreshold;

      if (market.analysis.confidence >= effectiveConfidenceThreshold) {
        await learningEngine.recordPrediction({
          symbol: market.symbol,
          timestamp: Date.now(),
          predictedPrice: market.analysis.prediction,
          confidence: market.analysis.confidence,
          indicators: {
            smc: market.analysis.strength / 100,
            volumeDelta: parseFloat(market.quoteVolume) / 10000000000,
            liquidity: (parseFloat(market.highPrice) - parseFloat(market.lowPrice)) / parseFloat(market.lastPrice),
            fvg: Math.abs(market.priceChangePercent) / 10,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error recording predictions:', error);
  }
}

/**
 * Update past predictions with actual prices
 * Optionally prioritizes favourite assets when enabled
 */
export async function updatePastPredictions(
  marketData: BinanceMarketData[],
  prioritization?: LearningPrioritization
): Promise<void> {
  try {
    await learningEngine.initialize();
    
    // Sort market data to prioritize favourites if enabled
    let sortedMarketData = [...marketData];
    if (prioritization?.enabled && prioritization.favouriteSymbols.length > 0) {
      sortedMarketData = sortedMarketData.sort((a, b) => {
        const aIsFavourite = prioritization.favouriteSymbols.includes(a.symbol);
        const bIsFavourite = prioritization.favouriteSymbols.includes(b.symbol);
        
        // Favourites come first
        if (aIsFavourite && !bIsFavourite) return -1;
        if (!aIsFavourite && bIsFavourite) return 1;
        return 0;
      });
    }
    
    for (const market of sortedMarketData) {
      await learningEngine.updatePredictionResult(
        market.symbol,
        Date.now(),
        parseFloat(market.lastPrice)
      );
      
      // Update asset stats after updating predictions
      await learningEngine.updateAssetStats(market.symbol);
    }
  } catch (error) {
    console.error('Error updating past predictions:', error);
  }
}
