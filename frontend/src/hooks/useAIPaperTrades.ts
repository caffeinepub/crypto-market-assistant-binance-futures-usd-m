import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PaperTrade, getAllOpenTrades } from '../lib/paperTradeStorage';
import { TradingModality } from '../lib/paperTradeStorage';

export function useAIPaperTrades(modalityFilter?: TradingModality) {
  const query = useQuery<PaperTrade[]>({
    queryKey: ['aiPaperTrades'],
    queryFn: async () => {
      const trades = await getAllOpenTrades();
      return trades;
    },
    refetchInterval: 5000,
    staleTime: 0,
  });

  const filtered = modalityFilter
    ? (query.data ?? []).filter(t => t.modality === modalityFilter)
    : (query.data ?? []);

  return {
    ...query,
    trades: filtered,
    allTrades: query.data ?? [],
  };
}

export function useInvalidatePaperTrades() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['aiPaperTrades'] });
    queryClient.invalidateQueries({ queryKey: ['paperTradeHistory'] });
  };
}
