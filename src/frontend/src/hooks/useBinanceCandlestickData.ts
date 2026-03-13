import { useQuery } from "@tanstack/react-query";
import { type BinanceKline, fetchBinanceKlines } from "./queries/binanceFetch";

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "1D", value: "1d" },
];

export function useBinanceCandlestickData(
  symbol: string,
  timeframe: Timeframe,
  limit = 200,
) {
  return useQuery<BinanceKline[]>({
    queryKey: ["candlestick", symbol, timeframe, limit],
    queryFn: () => fetchBinanceKlines(symbol, timeframe, limit),
    refetchInterval: 10_000,
    staleTime: 5_000,
    enabled: !!symbol,
    retry: 2,
  });
}
