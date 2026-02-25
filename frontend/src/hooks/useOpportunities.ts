import { useQuery } from '@tanstack/react-query';
import { useBinanceMarketData, BinanceMarketData } from './useQueries';
import {
  selectScalpingOpportunities,
  selectSwingOpportunities,
  selectBreakoutOpportunities,
  selectReversalOpportunities,
  selectSMCOpportunities,
  selectFVGOpportunities,
  OpportunityItem,
} from './queries/opportunityRules';

export interface OpportunitiesData {
  scalping: OpportunityItem[];
  swing: OpportunityItem[];
  breakout: OpportunityItem[];
  reversal: OpportunityItem[];
  smc: OpportunityItem[];
  fvg: OpportunityItem[];
}

/**
 * Hook to compute trading opportunities grouped by modality
 * Uses live Binance market data and deterministic selection rules
 */
export function useOpportunities() {
  const { data: marketData, error: marketError, isFetching, dataUpdatedAt } = useBinanceMarketData();

  return useQuery<OpportunitiesData, Error>({
    queryKey: ['opportunities', marketData],
    queryFn: async (): Promise<OpportunitiesData> => {
      if (!marketData || marketData.length === 0) {
        return {
          scalping: [],
          swing: [],
          breakout: [],
          reversal: [],
          smc: [],
          fvg: [],
        };
      }

      // Apply modality-specific selection rules
      const scalping = selectScalpingOpportunities(marketData);
      const swing = selectSwingOpportunities(marketData);
      const breakout = selectBreakoutOpportunities(marketData);
      const reversal = selectReversalOpportunities(marketData);
      const smc = selectSMCOpportunities(marketData);
      const fvg = selectFVGOpportunities(marketData);

      return {
        scalping,
        swing,
        breakout,
        reversal,
        smc,
        fvg,
      };
    },
    enabled: !!marketData && !isFetching,
    staleTime: 20000,
    // Return error from market data query if present
    ...(marketError && { error: marketError }),
  });
}
