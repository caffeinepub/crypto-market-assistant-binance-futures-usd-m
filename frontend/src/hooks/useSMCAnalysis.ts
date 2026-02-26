import { useMemo } from 'react';
import { analyzeSMC, type SMCAnalysisResult } from '../lib/smcIndicators';
import type { BinanceKline } from './queries/binanceFetch';

export function useSMCAnalysis(candles: BinanceKline[] | undefined): SMCAnalysisResult {
  return useMemo(() => {
    if (!candles || candles.length < 20) {
      return {
        orderBlocks: [],
        fairValueGaps: [],
        structurePoints: [],
        liquidityZones: [],
        premiumDiscountZone: null,
        bias: 'neutral' as const,
        biasStrength: 0,
      };
    }
    return analyzeSMC(candles);
  }, [candles]);
}
