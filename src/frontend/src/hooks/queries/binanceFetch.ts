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
