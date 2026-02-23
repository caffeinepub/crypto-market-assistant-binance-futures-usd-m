import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTrades, addTrade, removeTrade, MonitoredTrade, initTradeDB } from '@/lib/tradeStorage';

export function useMonitoredTrades() {
  const queryClient = useQueryClient();

  const tradesQuery = useQuery<MonitoredTrade[]>({
    queryKey: ['monitored-trades'],
    queryFn: async () => {
      await initTradeDB();
      return getAllTrades();
    },
    staleTime: 60000, // 1 minute
  });

  const addTradeMutation = useMutation({
    mutationFn: addTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitored-trades'] });
    },
  });

  const removeTradeMutation = useMutation({
    mutationFn: removeTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitored-trades'] });
    },
  });

  return {
    trades: tradesQuery.data || [],
    isLoading: tradesQuery.isLoading,
    error: tradesQuery.error,
    addTrade: addTradeMutation.mutateAsync,
    removeTrade: removeTradeMutation.mutateAsync,
    isAddingTrade: addTradeMutation.isPending,
    isRemovingTrade: removeTradeMutation.isPending,
  };
}
