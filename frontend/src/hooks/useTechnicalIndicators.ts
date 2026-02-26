import { useMemo } from 'react';
import { calculateAllIndicators, type TechnicalIndicatorsResult } from '../lib/technicalIndicators';
import type { BinanceKline } from './queries/binanceFetch';

export function useTechnicalIndicators(
  candles: BinanceKline[] | undefined
): TechnicalIndicatorsResult | null {
  return useMemo(() => {
    if (!candles || candles.length < 30) return null;
    return calculateAllIndicators(candles);
  }, [candles]);
}
