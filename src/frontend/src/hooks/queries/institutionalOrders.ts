import { useQuery } from '@tanstack/react-query';
import { DirectionType } from '../useQueries';
import { fetchBinanceFuturesBTC, fetchBinanceSpotBTC } from './binanceFetch';
import { useActor } from '../useActor';

export interface InstitutionalSignal {
  direction: DirectionType;
  confidence: number;
  price: number;
}

export interface InstitutionalOrdersData {
  signals: InstitutionalSignal[];
  lastUpdated: number;
  usedBackendFallback?: boolean;
}

/**
 * Detect institutional orders from BTC market data
 * Uses volume patterns and price action to identify institutional activity
 * Hardened to handle edge cases like high==low
 */
function detectInstitutionalSignals(
  price: number,
  open: number,
  high: number,
  low: number,
  volume: number,
  priceChange: number
): InstitutionalSignal[] {
  const signals: InstitutionalSignal[] = [];
  
  // Validate inputs to prevent NaN/Infinity
  if (!isFinite(price) || !isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(volume) || !isFinite(priceChange)) {
    console.warn('Invalid input data for institutional signal detection');
    return signals;
  }
  
  // Normalize volume (in billions for easier thresholds)
  const volumeDelta = volume / 1_000_000_000;
  
  // Signal 1: Large volume with minimal price movement (accumulation/distribution)
  if (volumeDelta > 8 && Math.abs(priceChange) < 2) {
    signals.push({
      direction: price > open ? 'up' : 'down',
      confidence: Math.min(volumeDelta / 12, 0.95),
      price: (open + price) / 2,
    });
  }
  
  // Signal 2: Strong directional move with high volume (institutional momentum)
  if (Math.abs(priceChange) > 5 && volumeDelta > 6) {
    signals.push({
      direction: priceChange > 0 ? 'up' : 'down',
      confidence: Math.min((Math.abs(priceChange) + volumeDelta) / 18, 0.9),
      price: (low + high) / 2,
    });
  }
  
  // Signal 3: Price rejection at key levels with volume spike
  // Hardened: check for zero range to prevent division by zero
  const range = high - low;
  if (range > 0 && volumeDelta > 7) {
    const pricePosition = (price - low) / range;
    if (pricePosition < 0.2 || pricePosition > 0.8) {
      signals.push({
        direction: pricePosition < 0.2 ? 'up' : 'down',
        confidence: Math.min(volumeDelta / 10, 0.85),
        price: pricePosition < 0.2 ? low : high,
      });
    }
  }

  return signals;
}

/**
 * Fetch and analyze BTC Futures USD-M institutional orders
 */
export function useInstitutionalOrdersFutures() {
  return useQuery<InstitutionalOrdersData, Error>({
    queryKey: ['institutional-orders-futures'],
    queryFn: async (): Promise<InstitutionalOrdersData> => {
      try {
        const data = await fetchBinanceFuturesBTC();
        
        const price = parseFloat(data.lastPrice);
        const open = parseFloat(data.openPrice);
        const high = parseFloat(data.highPrice);
        const low = parseFloat(data.lowPrice);
        const volume = parseFloat(data.quoteVolume);
        const priceChange = parseFloat(data.priceChangePercent);
        
        const signals = detectInstitutionalSignals(price, open, high, low, volume, priceChange);
        
        return {
          signals,
          lastUpdated: Date.now(),
        };
      } catch (error) {
        console.error('Error fetching Futures institutional orders:', error);
        throw error;
      }
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 45000,
    retry: 2,
  });
}

/**
 * Fetch and analyze BTC Spot institutional orders with backend fallback
 */
export function useInstitutionalOrdersSpot() {
  const { actor } = useActor();
  
  return useQuery<InstitutionalOrdersData, Error>({
    queryKey: ['institutional-orders-spot'],
    queryFn: async (): Promise<InstitutionalOrdersData> => {
      let usedBackendFallback = false;
      let data: any;
      
      // First attempt: direct browser fetch
      try {
        data = await fetchBinanceSpotBTC();
      } catch (browserError) {
        console.warn('Browser fetch failed for Spot, attempting backend fallback:', browserError);
        
        // Second attempt: backend fallback
        if (!actor) {
          throw new Error('Browser fetch failed and backend actor not available. Please refresh the page.');
        }
        
        try {
          const backendResponse = await actor.getBinanceSpotTickerBTCUSDT();
          
          // Parse the JSON response from backend
          if (!backendResponse || backendResponse.trim() === '') {
            throw new Error('Backend returned empty response for Spot data.');
          }
          
          data = JSON.parse(backendResponse);
          usedBackendFallback = true;
          console.info('Successfully fetched Spot data via backend fallback');
        } catch (backendError) {
          console.error('Backend fallback also failed:', backendError);
          // Re-throw the original browser error with context
          throw new Error(`Browser fetch failed: ${browserError instanceof Error ? browserError.message : 'Unknown error'}. Backend fallback also failed.`);
        }
      }
      
      // Validate and parse the data
      try {
        const price = parseFloat(data.lastPrice);
        const open = parseFloat(data.openPrice);
        const high = parseFloat(data.highPrice);
        const low = parseFloat(data.lowPrice);
        const volume = parseFloat(data.quoteVolume);
        const priceChange = parseFloat(data.priceChangePercent);
        
        // Additional validation
        if (!isFinite(price) || !isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(volume)) {
          throw new Error('Invalid numeric data received from Spot API');
        }
        
        const signals = detectInstitutionalSignals(price, open, high, low, volume, priceChange);
        
        return {
          signals,
          lastUpdated: Date.now(),
          usedBackendFallback,
        };
      } catch (parseError) {
        console.error('Error parsing Spot data:', parseError);
        throw new Error(`Failed to parse Spot data: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 45000,
    retry: 2,
  });
}
