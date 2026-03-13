import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ClosedPaperTrade,
  type TradeHistorySummary,
  clearAllHistory,
  getAllClosedTrades,
  getTradeHistorySummary,
} from "../lib/paperTradeStorage";

export function usePaperTradeHistory() {
  const queryClient = useQueryClient();

  const historyQuery = useQuery<ClosedPaperTrade[]>({
    queryKey: ["paperTradeHistory"],
    queryFn: getAllClosedTrades,
    refetchInterval: 10000,
    staleTime: 0,
  });

  const summaryQuery = useQuery<TradeHistorySummary>({
    queryKey: ["paperTradeHistorySummary"],
    queryFn: getTradeHistorySummary,
    refetchInterval: 10000,
    staleTime: 0,
  });

  const clearHistoryMutation = useMutation({
    mutationFn: clearAllHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paperTradeHistory"] });
      queryClient.invalidateQueries({ queryKey: ["paperTradeHistorySummary"] });
    },
  });

  return {
    closedTrades: historyQuery.data ?? [],
    isLoadingHistory: historyQuery.isLoading,
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,
    clearHistory: clearHistoryMutation,
  };
}
