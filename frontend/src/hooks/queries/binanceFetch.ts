// Browser-based Binance data fetching module.
// Exports both the legacy BinanceTicker shape (used by useQueries.ts, institutionalOrders.ts, etc.)
// and the new typed helpers (BinanceKline, fetchBinanceKlines, fetchBinanceFuturesTicker, etc.)
// used by the SMC trading dashboard.

// ─── Legacy ticker shape (string fields, matches Binance raw API) ─────────────
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

// ─── New typed shape (numeric fields) ────────────────────────────────────────
export interface BinanceMarketData {
  symbol: string;
  price: number;
  priceChangePercent: number;
  volume: number;
  quoteVolume: number;
  high24h: number;
  low24h: number;
  openPrice: number;
  count: number;
}

export interface BinanceKline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type BinanceErrorType =
  | 'network'
  | 'blocked'
  | 'rate_limit'
  | 'server'
  | 'not_found'
  | 'unknown';

export interface BinanceFetchError {
  type: BinanceErrorType;
  message: string;
  status?: number;
}

// ─── Error classification ─────────────────────────────────────────────────────
function classifyError(err: unknown, status?: number): BinanceFetchError {
  if (status === 429 || status === 418) {
    return { type: 'rate_limit', message: 'Rate limit exceeded. Please wait.', status };
  }
  if (status === 451 || status === 403) {
    return { type: 'blocked', message: 'Binance is blocked or restricted in your region.', status };
  }
  if (status === 404) {
    return { type: 'not_found', message: 'Symbol not found.', status };
  }
  if (status && status >= 500) {
    return { type: 'server', message: 'Binance server error.', status };
  }
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return { type: 'network', message: 'Network error. Check your connection.' };
  }
  return { type: 'unknown', message: String(err) };
}

const FUTURES_BASE = 'https://fapi.binance.com';
const SPOT_BASE = 'https://api.binance.com';

// ─── Legacy helpers (return BinanceTicker with string fields) ─────────────────

/**
 * Fetch all Binance Futures USD-M 24hr ticker data (legacy BinanceTicker shape)
 */
export async function fetchBinanceMarketData(): Promise<BinanceTicker[]> {
  try {
    const response = await fetch(`${FUTURES_BASE}/fapi/v1/ticker/24hr`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data as BinanceTicker[];
  } catch (error) {
    const classified = classifyError(error);
    throw new Error(classified.message);
  }
}

/**
 * Fetch a single Binance Futures USD-M ticker by symbol (legacy BinanceTicker shape)
 */
export async function fetchBinanceFuturesTicker(symbol: string): Promise<BinanceTicker> {
  try {
    const response = await fetch(`${FUTURES_BASE}/fapi/v1/ticker/24hr?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data as BinanceTicker;
  } catch (error) {
    const classified = classifyError(error);
    throw new Error(classified.message);
  }
}

/**
 * Fetch a single asset by symbol — alias for fetchBinanceFuturesTicker (legacy)
 */
export async function fetchBinanceAsset(symbol: string): Promise<BinanceTicker> {
  return fetchBinanceFuturesTicker(symbol);
}

/**
 * Fetch BTC Futures ticker (legacy BinanceTicker shape)
 */
export async function fetchBinanceBTCFutures(): Promise<BinanceTicker> {
  return fetchBinanceFuturesTicker('BTCUSDT');
}

/**
 * Fetch BTC Spot ticker (legacy BinanceTicker shape)
 */
export async function fetchBinanceBTCSpot(): Promise<BinanceTicker> {
  try {
    const response = await fetch(`${SPOT_BASE}/api/v3/ticker/24hr?symbol=BTCUSDT`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data as BinanceTicker;
  } catch (error) {
    const classified = classifyError(error);
    throw new Error(classified.message);
  }
}

/**
 * Filter for major USDT pairs only (legacy helper)
 */
export function filterMajorPairs(tickers: BinanceTicker[]): BinanceTicker[] {
  const majorSymbols = new Set([
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
  ]);
  return tickers.filter((t) => majorSymbols.has(t.symbol));
}

// ─── New helpers (return numeric BinanceMarketData / BinanceKline) ────────────

/**
 * Fetch all Binance Futures USD-M tickers as numeric BinanceMarketData
 */
export async function fetchBinanceFuturesTickers(): Promise<BinanceMarketData[]> {
  const res = await fetch(`${FUTURES_BASE}/fapi/v1/ticker/24hr`);
  if (!res.ok) throw classifyError(null, res.status);
  const data = await res.json() as Record<string, unknown>[];
  return data
    .filter((d) => String(d.symbol).endsWith('USDT'))
    .map((d) => ({
      symbol: String(d.symbol),
      price: parseFloat(String(d.lastPrice)),
      priceChangePercent: parseFloat(String(d.priceChangePercent)),
      volume: parseFloat(String(d.volume)),
      quoteVolume: parseFloat(String(d.quoteVolume)),
      high24h: parseFloat(String(d.highPrice)),
      low24h: parseFloat(String(d.lowPrice)),
      openPrice: parseFloat(String(d.openPrice)),
      count: parseInt(String(d.count), 10),
    }));
}

/**
 * Fetch candlestick (klines) data for a symbol and interval from Binance Futures
 */
export async function fetchBinanceKlines(
  symbol: string,
  interval: string,
  limit = 200
): Promise<BinanceKline[]> {
  const url = `${FUTURES_BASE}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw classifyError(null, res.status);
  const data = await res.json() as unknown[][];
  return data.map((k) => ({
    time: Number(k[0]) / 1000,
    open: parseFloat(String(k[1])),
    high: parseFloat(String(k[2])),
    low: parseFloat(String(k[3])),
    close: parseFloat(String(k[4])),
    volume: parseFloat(String(k[5])),
  }));
}
