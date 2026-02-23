// Browser-based Binance data fetching module with support for Futures USD-M market data,
// individual asset lookup, BTC Futures fetch, and BTC Spot fetch with improved error
// classification that categorizes network errors, CORS/blocked responses, HTTP status codes,
// and rate limits for actionable user messaging.

export interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  lastPrice: string;
  lastQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  count: number;
}

export type ErrorCategory = 'network' | 'blocked' | 'rate-limit' | 'server' | 'unknown';

export interface ClassifiedError extends Error {
  category: ErrorCategory;
  originalError?: unknown;
}

/**
 * Classify fetch errors into actionable categories
 */
function classifyError(error: unknown): ClassifiedError {
  const baseMessage = error instanceof Error ? error.message : String(error);

  // Network errors (no connection, DNS failure, etc.)
  if (
    baseMessage.includes('Failed to fetch') ||
    baseMessage.includes('NetworkError') ||
    baseMessage.includes('Network request failed')
  ) {
    const classified = new Error(
      'Network error: Unable to reach Binance API. Check your internet connection.'
    ) as ClassifiedError;
    classified.category = 'network';
    classified.originalError = error;
    return classified;
  }

  // CORS / Blocked by Binance
  if (
    baseMessage.includes('CORS') ||
    baseMessage.includes('blocked') ||
    baseMessage.includes('403') ||
    baseMessage.includes('Forbidden')
  ) {
    const classified = new Error(
      'Binance API blocked: Access restricted from your region or browser. Try using a VPN or different network.'
    ) as ClassifiedError;
    classified.category = 'blocked';
    classified.originalError = error;
    return classified;
  }

  // Rate limiting
  if (baseMessage.includes('429') || baseMessage.includes('Too Many Requests')) {
    const classified = new Error(
      'Rate limit exceeded: Too many requests to Binance API. Please wait a moment and try again.'
    ) as ClassifiedError;
    classified.category = 'rate-limit';
    classified.originalError = error;
    return classified;
  }

  // Server errors (5xx)
  if (baseMessage.includes('500') || baseMessage.includes('502') || baseMessage.includes('503')) {
    const classified = new Error(
      'Binance server error: The API is temporarily unavailable. Please try again later.'
    ) as ClassifiedError;
    classified.category = 'server';
    classified.originalError = error;
    return classified;
  }

  // Unknown error
  const classified = new Error(`Binance API error: ${baseMessage}`) as ClassifiedError;
  classified.category = 'unknown';
  classified.originalError = error;
  return classified;
}

/**
 * Fetch all Binance Futures USD-M 24hr ticker data
 */
export async function fetchBinanceMarketData(): Promise<BinanceTicker[]> {
  try {
    const response = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as BinanceTicker[];
  } catch (error) {
    throw classifyError(error);
  }
}

/**
 * Fetch a single Binance Futures USD-M ticker by symbol
 */
export async function fetchBinanceFuturesTicker(symbol: string): Promise<BinanceTicker> {
  try {
    const response = await fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as BinanceTicker;
  } catch (error) {
    throw classifyError(error);
  }
}

/**
 * Fetch a single asset by symbol (alias for fetchBinanceFuturesTicker)
 */
export async function fetchBinanceAsset(symbol: string): Promise<BinanceTicker> {
  return fetchBinanceFuturesTicker(symbol);
}

/**
 * Fetch BTC Futures ticker
 */
export async function fetchBinanceBTCFutures(): Promise<BinanceTicker> {
  return fetchBinanceFuturesTicker('BTCUSDT');
}

/**
 * Fetch BTC Spot ticker
 */
export async function fetchBinanceBTCSpot(): Promise<BinanceTicker> {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as BinanceTicker;
  } catch (error) {
    throw classifyError(error);
  }
}

/**
 * Filter for major USDT pairs only
 */
export function filterMajorPairs(tickers: BinanceTicker[]): BinanceTicker[] {
  const majorSymbols = [
    'BTCUSDT',
    'ETHUSDT',
    'BNBUSDT',
    'SOLUSDT',
    'XRPUSDT',
    'ADAUSDT',
    'DOGEUSDT',
    'MATICUSDT',
    'DOTUSDT',
    'LTCUSDT',
    'AVAXUSDT',
    'LINKUSDT',
    'ATOMUSDT',
    'UNIUSDT',
    'ETCUSDT',
    'XLMUSDT',
    'NEARUSDT',
    'ALGOUSDT',
    'APTUSDT',
    'ARBUSDT',
    'OPUSDT',
  ];

  return tickers.filter((ticker) => majorSymbols.includes(ticker.symbol));
}
