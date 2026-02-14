import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { parseDepthData, aggregateDepth, computeMetrics, type DepthLevel, type DepthMetrics } from '@/lib/orderBookDepth';

export interface OrderBookData {
  bids: DepthLevel[];
  asks: DepthLevel[];
  metrics: DepthMetrics | null;
  isEmpty: boolean;
  lastUpdated: number;
  usedBackendFallback?: boolean;
}

/**
 * Classify error type for better user messaging
 */
function classifyDepthError(error: unknown): string {
  if (error instanceof TypeError) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network error: Unable to reach Binance API. Check your internet connection.';
    }
    return 'Network error: Failed to connect to Binance API.';
  }
  
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    // Check for CORS or blocked responses
    if (msg.includes('cors') || msg.includes('blocked')) {
      return 'Binance API blocked: CORS or network restriction detected.';
    }
    
    // Check for restricted location
    if (msg.includes('restricted') || msg.includes('unavailable')) {
      return 'Binance API blocked: Service unavailable from your location.';
    }
    
    // Check for HTTP status errors
    if (msg.includes('403') || msg.includes('forbidden')) {
      return 'Binance API blocked: Access forbidden (HTTP 403).';
    }
    
    if (msg.includes('429')) {
      return 'Binance API error: Rate limit exceeded (HTTP 429).';
    }
    
    if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
      return 'Binance API error: Server error. Try again later.';
    }
    
    // Return the original error message if it's already descriptive
    if (error.message.startsWith('Binance')) {
      return error.message;
    }
    
    return `Binance API error: ${error.message}`;
  }
  
  return 'Unknown error fetching depth data.';
}

/**
 * Fetch BTCUSDT depth from Binance Futures USD-M
 */
async function fetchFuturesDepth(): Promise<any> {
  const response = await fetch('https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT&limit=100', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const statusText = response.statusText || 'Unknown error';
    throw new Error(`Binance Futures API error: HTTP ${response.status} ${statusText}`);
  }
  
  const data = await response.json();
  
  // Check if the response is an error object
  if (data && typeof data === 'object' && 'code' in data && 'msg' in data) {
    throw new Error(`Binance Futures API blocked: ${data.msg || 'Service unavailable'}`);
  }
  
  return data;
}

/**
 * Fetch BTCUSDT depth from Binance Spot
 */
async function fetchSpotDepth(): Promise<any> {
  const response = await fetch('https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=100', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const statusText = response.statusText || 'Unknown error';
    throw new Error(`Binance Spot API error: HTTP ${response.status} ${statusText}`);
  }
  
  const data = await response.json();
  
  // Check if the response is an error object
  if (data && typeof data === 'object' && 'code' in data && 'msg' in data) {
    throw new Error(`Binance Spot API blocked: ${data.msg || 'Service unavailable'}`);
  }
  
  return data;
}

/**
 * React Query hook for BTC Futures order book depth
 */
export function useOrderBookFutures(aggregationLevel: number) {
  return useQuery<OrderBookData, Error>({
    queryKey: ['orderbook-futures', aggregationLevel],
    queryFn: async (): Promise<OrderBookData> => {
      try {
        const rawData = await fetchFuturesDepth();
        const { bids, asks, isEmpty } = parseDepthData(rawData);
        
        if (isEmpty) {
          return {
            bids: [],
            asks: [],
            metrics: null,
            isEmpty: true,
            lastUpdated: Date.now(),
          };
        }
        
        // Aggregate depth by price level
        const aggregatedBids = aggregateDepth(bids, aggregationLevel, 'bid');
        const aggregatedAsks = aggregateDepth(asks, aggregationLevel, 'ask');
        
        // Compute metrics
        const metrics = computeMetrics(aggregatedBids, aggregatedAsks);
        
        return {
          bids: aggregatedBids,
          asks: aggregatedAsks,
          metrics,
          isEmpty: false,
          lastUpdated: Date.now(),
        };
      } catch (error) {
        const classifiedError = classifyDepthError(error);
        throw new Error(classifiedError);
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 8000,
    retry: 2,
  });
}

/**
 * React Query hook for BTC Spot order book depth with backend fallback
 */
export function useOrderBookSpot(aggregationLevel: number) {
  const { actor } = useActor();
  
  return useQuery<OrderBookData, Error>({
    queryKey: ['orderbook-spot', aggregationLevel],
    queryFn: async (): Promise<OrderBookData> => {
      let usedBackendFallback = false;
      let rawData: any;
      
      // First attempt: direct browser fetch
      try {
        rawData = await fetchSpotDepth();
      } catch (browserError) {
        console.warn('Browser fetch failed for Spot depth, attempting backend fallback:', browserError);
        
        // Second attempt: backend fallback
        if (!actor) {
          throw new Error('Browser fetch failed and backend actor not available. Please refresh the page.');
        }
        
        try {
          const backendResponse = await actor.getBinanceSpotDepthBTCUSDT();
          
          // Parse the JSON response from backend
          if (!backendResponse || backendResponse.trim() === '') {
            throw new Error('Backend returned empty response for Spot depth data.');
          }
          
          rawData = JSON.parse(backendResponse);
          usedBackendFallback = true;
          console.info('Successfully fetched Spot depth data via backend fallback');
        } catch (backendError) {
          console.error('Backend fallback also failed:', backendError);
          // Throw consolidated error
          const browserMsg = classifyDepthError(browserError);
          throw new Error(`Browser fetch failed: ${browserMsg}. Backend fallback also failed.`);
        }
      }
      
      // Parse and validate the data
      try {
        const { bids, asks, isEmpty } = parseDepthData(rawData);
        
        if (isEmpty) {
          return {
            bids: [],
            asks: [],
            metrics: null,
            isEmpty: true,
            lastUpdated: Date.now(),
            usedBackendFallback,
          };
        }
        
        // Aggregate depth by price level
        const aggregatedBids = aggregateDepth(bids, aggregationLevel, 'bid');
        const aggregatedAsks = aggregateDepth(asks, aggregationLevel, 'ask');
        
        // Compute metrics
        const metrics = computeMetrics(aggregatedBids, aggregatedAsks);
        
        return {
          bids: aggregatedBids,
          asks: aggregatedAsks,
          metrics,
          isEmpty: false,
          lastUpdated: Date.now(),
          usedBackendFallback,
        };
      } catch (parseError) {
        console.error('Error parsing Spot depth data:', parseError);
        throw new Error(`Failed to parse Spot depth data: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 8000,
    retry: 2,
  });
}
