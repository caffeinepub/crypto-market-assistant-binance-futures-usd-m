import { BinanceTicker } from '../useQueries';

/**
 * Binance Futures metrics for funding rate and open interest
 * Browser-based fetching with safe partial-failure handling
 */

export interface FundingRateData {
  symbol: string;
  fundingRate: number;
  fundingTime: number;
  markPrice: number;
}

export interface OpenInterestData {
  symbol: string;
  openInterest: number;
  time: number;
}

/**
 * Fetch funding rates for USD-M Futures
 * Returns partial results on per-symbol failures
 */
export async function fetchFundingRates(symbols: string[]): Promise<Map<string, FundingRateData>> {
  const results = new Map<string, FundingRateData>();
  
  try {
    // Fetch premium index which includes funding rate info
    const response = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Funding rate fetch failed: ${response.status}`);
      return results;
    }
    
    const data = await response.json();
    
    // Check for Binance error response
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('code' in data && 'msg' in data) {
        console.warn(`Funding rate API blocked: ${data.msg}`);
        return results;
      }
    }
    
    if (!Array.isArray(data)) {
      console.warn('Invalid funding rate response format');
      return results;
    }
    
    // Filter for requested symbols
    const symbolSet = new Set(symbols);
    data.forEach((item: any) => {
      if (symbolSet.has(item.symbol)) {
        try {
          results.set(item.symbol, {
            symbol: item.symbol,
            fundingRate: parseFloat(item.lastFundingRate || '0'),
            fundingTime: parseInt(item.nextFundingTime || '0'),
            markPrice: parseFloat(item.markPrice || '0'),
          });
        } catch (error) {
          console.warn(`Error parsing funding rate for ${item.symbol}:`, error);
        }
      }
    });
    
  } catch (error) {
    console.warn('Error fetching funding rates (non-critical):', error);
  }
  
  return results;
}

/**
 * Fetch open interest for USD-M Futures
 * Returns partial results on per-symbol failures
 */
export async function fetchOpenInterest(symbols: string[]): Promise<Map<string, OpenInterestData>> {
  const results = new Map<string, OpenInterestData>();
  
  try {
    const response = await fetch('https://fapi.binance.com/fapi/v1/openInterest', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Open interest fetch failed: ${response.status}`);
      return results;
    }
    
    const data = await response.json();
    
    // Check for Binance error response
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('code' in data && 'msg' in data) {
        console.warn(`Open interest API blocked: ${data.msg}`);
        return results;
      }
    }
    
    if (!Array.isArray(data)) {
      console.warn('Invalid open interest response format');
      return results;
    }
    
    // Filter for requested symbols
    const symbolSet = new Set(symbols);
    data.forEach((item: any) => {
      if (symbolSet.has(item.symbol)) {
        try {
          results.set(item.symbol, {
            symbol: item.symbol,
            openInterest: parseFloat(item.openInterest || '0'),
            time: parseInt(item.time || Date.now()),
          });
        } catch (error) {
          console.warn(`Error parsing open interest for ${item.symbol}:`, error);
        }
      }
    });
    
  } catch (error) {
    console.warn('Error fetching open interest (non-critical):', error);
  }
  
  return results;
}

/**
 * Session-based storage for prior samples (in-memory)
 * Used for detecting changes in funding and open interest
 */
class MetricsHistory {
  private fundingHistory = new Map<string, FundingRateData>();
  private openInterestHistory = new Map<string, OpenInterestData>();
  
  updateFunding(data: Map<string, FundingRateData>) {
    data.forEach((value, key) => {
      this.fundingHistory.set(key, value);
    });
  }
  
  updateOpenInterest(data: Map<string, OpenInterestData>) {
    data.forEach((value, key) => {
      this.openInterestHistory.set(key, value);
    });
  }
  
  getPriorFunding(symbol: string): FundingRateData | undefined {
    return this.fundingHistory.get(symbol);
  }
  
  getPriorOpenInterest(symbol: string): OpenInterestData | undefined {
    return this.openInterestHistory.get(symbol);
  }
}

export const metricsHistory = new MetricsHistory();
