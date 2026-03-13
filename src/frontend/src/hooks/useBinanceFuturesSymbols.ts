import { useQuery } from "@tanstack/react-query";
import { FALLBACK_FUTURES_SYMBOLS } from "../lib/fallbackSymbols";

interface BinanceSymbolInfo {
  symbol: string;
  contractType: string;
  quoteAsset: string;
  status: string;
}

export function useBinanceFuturesSymbols() {
  return useQuery<string[]>({
    queryKey: ["binanceFuturesSymbols"],
    queryFn: async () => {
      try {
        const res = await fetch(
          "https://fapi.binance.com/fapi/v1/exchangeInfo",
        );
        if (!res.ok) throw new Error("Failed to fetch exchange info");
        const data = await res.json();
        const symbols: string[] = (data.symbols || [])
          .filter(
            (s: BinanceSymbolInfo) =>
              s.contractType === "PERPETUAL" &&
              s.quoteAsset === "USDT" &&
              s.status === "TRADING",
          )
          .map((s: BinanceSymbolInfo) => s.symbol);

        if (symbols.length === 0) throw new Error("No symbols returned");
        return symbols;
      } catch {
        return FALLBACK_FUTURES_SYMBOLS;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
}
