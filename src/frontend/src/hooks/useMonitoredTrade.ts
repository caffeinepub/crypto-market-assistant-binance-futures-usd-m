import { useQuery } from '@tanstack/react-query';
import { MonitoredTrade } from '@/lib/tradeStorage';
import { fetchBinanceFuturesTicker } from './queries/binanceFetch';

export interface MonitoredTradeData {
  trade: MonitoredTrade;
  currentPrice: number;
  pnlPercentage: number;
  liquidationPrice: number;
  isLoading: boolean;
  error: Error | null;
}

export function useMonitoredTrade(trade: MonitoredTrade | null): MonitoredTradeData | null {
  const query = useQuery({
    queryKey: ['monitored-trade-price', trade?.symbol],
    queryFn: async () => {
      if (!trade) throw new Error('No trade provided');
      
      const ticker = await fetchBinanceFuturesTicker(trade.symbol);
      return parseFloat(ticker.lastPrice);
    },
    enabled: !!trade,
    refetchInterval: 5000, // Update every 5 seconds
    staleTime: 3000,
  });

  if (!trade) return null;

  const currentPrice = query.data || trade.entryPrice;

  // Calculate PnL percentage (direction-aware)
  let pnlPercentage: number;
  if (trade.direction === 'long') {
    pnlPercentage = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100 * trade.leverage;
  } else {
    pnlPercentage = ((trade.entryPrice - currentPrice) / trade.entryPrice) * 100 * trade.leverage;
  }

  // Calculate liquidation price
  let liquidationPrice: number;
  if (trade.direction === 'long') {
    liquidationPrice = trade.entryPrice * (1 - 1 / trade.leverage);
  } else {
    liquidationPrice = trade.entryPrice * (1 + 1 / trade.leverage);
  }

  return {
    trade,
    currentPrice,
    pnlPercentage,
    liquidationPrice,
    isLoading: query.isLoading,
    error: query.error,
  };
}
