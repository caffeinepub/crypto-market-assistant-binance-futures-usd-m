import { useMemo } from 'react';
import { BinanceMarketData } from './useQueries';
import { computeTradeRecommendation, RecommendationResult } from '@/lib/tradeRecommendation';

export interface UseTradeRecommendationParams {
  symbol: string | null;
  modality: string;
  marketData: BinanceMarketData[] | undefined;
}

export interface UseTradeRecommendationResult {
  result: RecommendationResult | null;
  isReady: boolean;
}

/**
 * Hook to derive trade recommendation for selected symbol and modality
 */
export function useTradeRecommendation({
  symbol,
  modality,
  marketData,
}: UseTradeRecommendationParams): UseTradeRecommendationResult {
  const result = useMemo<RecommendationResult | null>(() => {
    if (!symbol || !marketData || marketData.length === 0) {
      return null;
    }

    // Find the selected asset in market data
    const asset = marketData.find((m) => m.symbol === symbol);
    if (!asset) {
      return {
        success: false,
        error: {
          reason: 'Asset not found in current market data',
          missingData: ['market data for ' + symbol],
        },
      };
    }

    // Compute recommendation
    return computeTradeRecommendation(modality, asset);
  }, [symbol, modality, marketData]);

  return {
    result,
    isReady: !!result,
  };
}
