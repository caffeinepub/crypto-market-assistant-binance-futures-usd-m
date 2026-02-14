import { BinanceTicker } from '../useQueries';

/**
 * Browser-based Binance Futures USD-M data fetching
 * Primary data source for real-time market data
 */

/**
 * Fetch all Binance Futures USD-M market data directly from Binance API
 * This is the primary data source for the application
 */
export async function fetchBinanceMarketData(): Promise<BinanceTicker[]> {
  try {
    const response = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if the response is an error object (e.g., restricted location)
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('code' in data && 'msg' in data) {
        // This is a Binance error response
        throw new Error(`Binance API blocked: ${data.msg || 'Service unavailable from restricted location'}`);
      }
    }
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from Binance API');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching Binance market data:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach Binance API. Check your internet connection.');
    }
    throw error;
  }
}

/**
 * Fetch specific asset data from Binance Futures
 * Used for asset search functionality
 */
export async function fetchBinanceAsset(symbol: string): Promise<BinanceTicker> {
  try {
    const response = await fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(`Asset ${symbol} not found on Binance Futures`);
      }
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if the response is an error object (e.g., restricted location)
    if (data && typeof data === 'object' && 'code' in data && 'msg' in data) {
      // This is a Binance error response
      throw new Error(`Binance API blocked: ${data.msg || 'Service unavailable from restricted location'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching asset ${symbol}:`, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach Binance API. Check your internet connection.');
    }
    throw error;
  }
}

/**
 * Fetch BTCUSDT data from Binance Futures
 */
export async function fetchBinanceFuturesBTC(): Promise<BinanceTicker> {
  return fetchBinanceAsset('BTCUSDT');
}

/**
 * Classify error type for better user messaging
 */
function classifySpotError(error: unknown): string {
  if (error instanceof TypeError) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network error: Unable to reach Binance Spot API. Check your internet connection.';
    }
    return 'Network error: Failed to connect to Binance Spot API.';
  }
  
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    // Check for CORS or blocked responses
    if (msg.includes('cors') || msg.includes('blocked')) {
      return 'Binance Spot API blocked: CORS or network restriction detected.';
    }
    
    // Check for restricted location
    if (msg.includes('restricted') || msg.includes('unavailable')) {
      return 'Binance Spot API blocked: Service unavailable from your location.';
    }
    
    // Check for HTTP status errors
    if (msg.includes('403') || msg.includes('forbidden')) {
      return 'Binance Spot API blocked: Access forbidden (HTTP 403).';
    }
    
    if (msg.includes('429')) {
      return 'Binance Spot API error: Rate limit exceeded (HTTP 429).';
    }
    
    if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
      return 'Binance Spot API error: Server error. Try again later.';
    }
    
    // Return the original error message if it's already descriptive
    if (error.message.startsWith('Binance')) {
      return error.message;
    }
    
    return `Binance Spot API error: ${error.message}`;
  }
  
  return 'Unknown error fetching Binance Spot data.';
}

/**
 * Fetch BTCUSDT data from Binance Spot with improved error classification
 */
export async function fetchBinanceSpotBTC(): Promise<BinanceTicker> {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', {
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
    
    // Validate that we have the required fields
    if (!data.lastPrice || !data.openPrice || !data.highPrice || !data.lowPrice) {
      throw new Error('Invalid response format from Binance Spot API: missing required price fields');
    }
    
    return data;
  } catch (error) {
    const classifiedError = classifySpotError(error);
    throw new Error(classifiedError);
  }
}

/**
 * Filter for major USD-M trading pairs
 */
export function filterMajorPairs(data: BinanceTicker[]): BinanceTicker[] {
  const majorPairs = [
    'BTCUSDT',
    'ETHUSDT',
    'BNBUSDT',
    'SOLUSDT',
    'XRPUSDT',
    'ADAUSDT',
    'DOGEUSDT',
    'MATICUSDT',
    'DOTUSDT',
    'AVAXUSDT',
    'LINKUSDT',
    'UNIUSDT',
    'ATOMUSDT',
    'LTCUSDT',
    'NEARUSDT',
    'APTUSDT',
    'ARBUSDT',
    'OPUSDT',
    'ICPUSDT',
  ];

  return data.filter((ticker) => majorPairs.includes(ticker.symbol));
}
