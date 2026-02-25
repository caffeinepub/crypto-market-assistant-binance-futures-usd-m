// AI Paper Trading Engine - orchestrates autonomous fictitious trade execution
import {
  PaperTrade,
  TradingModality,
  addOpenTrade,
  updateTradePrice,
  closeTradeAndArchive,
  getAllOpenTrades,
  getOpenTradeByModality,
  initDB,
} from './paperTradeStorage';
import { FALLBACK_FUTURES_SYMBOLS } from './fallbackSymbols';

const PAPER_CAPITAL = 100; // $100 per trade
const PAPER_LEVERAGE = 10; // 10x leverage
const POLL_INTERVAL_MS = 8000; // 8 seconds
const MODALITIES: TradingModality[] = ['scalping', 'swing', 'breakout', 'reversal', 'smc', 'fvg'];

// Volatility multipliers per modality
const MODALITY_CONFIG: Record<TradingModality, { tpMult1: number; tpMult2: number; tpMult3: number; slMult: number }> = {
  scalping:  { tpMult1: 0.003, tpMult2: 0.006, tpMult3: 0.010, slMult: 0.004 },
  swing:     { tpMult1: 0.015, tpMult2: 0.030, tpMult3: 0.050, slMult: 0.012 },
  breakout:  { tpMult1: 0.020, tpMult2: 0.040, tpMult3: 0.070, slMult: 0.015 },
  reversal:  { tpMult1: 0.012, tpMult2: 0.025, tpMult3: 0.045, slMult: 0.010 },
  smc:       { tpMult1: 0.018, tpMult2: 0.035, tpMult3: 0.060, slMult: 0.013 },
  fvg:       { tpMult1: 0.010, tpMult2: 0.022, tpMult3: 0.040, slMult: 0.008 },
};

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
}

let engineRunning = false;
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let symbolUniverse: string[] = FALLBACK_FUTURES_SYMBOLS;
let cachedTickers: Map<string, BinanceTicker> = new Map();
let lastTickerFetch = 0;
const TICKER_CACHE_MS = 10000;

// Fetch all Binance USD-M futures tickers
async function fetchAllTickers(): Promise<Map<string, BinanceTicker>> {
  const now = Date.now();
  if (now - lastTickerFetch < TICKER_CACHE_MS && cachedTickers.size > 0) {
    return cachedTickers;
  }
  try {
    const res = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');
    if (!res.ok) throw new Error('Ticker fetch failed');
    const data: BinanceTicker[] = await res.json();
    const map = new Map<string, BinanceTicker>();
    for (const t of data) map.set(t.symbol, t);
    cachedTickers = map;
    lastTickerFetch = now;
    return map;
  } catch {
    return cachedTickers;
  }
}

// Fetch validated symbol list from Binance exchange info
export async function fetchValidatedSymbols(): Promise<string[]> {
  try {
    const res = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo');
    if (!res.ok) throw new Error('Exchange info fetch failed');
    const data = await res.json();
    const symbols: string[] = (data.symbols || [])
      .filter((s: { contractType: string; quoteAsset: string; status: string }) =>
        s.contractType === 'PERPETUAL' && s.quoteAsset === 'USDT' && s.status === 'TRADING'
      )
      .map((s: { symbol: string }) => s.symbol);
    if (symbols.length > 0) {
      symbolUniverse = symbols;
      return symbols;
    }
    return FALLBACK_FUTURES_SYMBOLS;
  } catch {
    return FALLBACK_FUTURES_SYMBOLS;
  }
}

// Score a symbol for a given modality using ticker data
function scoreSymbolForModality(ticker: BinanceTicker, modality: TradingModality): number {
  const price = parseFloat(ticker.lastPrice) || 0;
  const change = parseFloat(ticker.priceChangePercent) || 0;
  const volume = parseFloat(ticker.quoteVolume) || 0;
  const high = parseFloat(ticker.highPrice) || price;
  const low = parseFloat(ticker.lowPrice) || price;
  const range = price > 0 ? (high - low) / price : 0;

  if (price <= 0 || volume < 100000) return 0;

  switch (modality) {
    case 'scalping':
      // High volume, moderate volatility
      return (volume / 1e9) * 0.6 + Math.min(range * 10, 1) * 0.4;
    case 'swing':
      // Moderate volume, clear trend
      return (Math.abs(change) / 10) * 0.5 + (volume / 1e9) * 0.3 + range * 0.2;
    case 'breakout':
      // High range, strong momentum
      return range * 0.5 + (Math.abs(change) / 10) * 0.4 + (volume / 1e9) * 0.1;
    case 'reversal':
      // Extreme moves (potential reversal)
      return (Math.abs(change) > 5 ? Math.abs(change) / 20 : 0) * 0.7 + range * 0.3;
    case 'smc':
      // High liquidity, institutional-grade volume
      return (volume / 1e9) * 0.7 + (Math.abs(change) / 10) * 0.3;
    case 'fvg':
      // Gap-prone: high range relative to volume
      return range * 0.6 + (volume / 1e9) * 0.2 + (Math.abs(change) / 10) * 0.2;
    default:
      return 0;
  }
}

// Select best symbol for a modality
function selectBestSymbol(tickers: Map<string, BinanceTicker>, modality: TradingModality, exclude: string[] = []): string | null {
  let bestSymbol: string | null = null;
  let bestScore = -1;

  for (const symbol of symbolUniverse) {
    if (exclude.includes(symbol)) continue;
    const ticker = tickers.get(symbol);
    if (!ticker) continue;
    const score = scoreSymbolForModality(ticker, modality);
    if (score > bestScore) {
      bestScore = score;
      bestSymbol = symbol;
    }
  }
  return bestSymbol;
}

// Determine direction based on modality and market data
function determineDirection(ticker: BinanceTicker, modality: TradingModality): 'Long' | 'Short' {
  const change = parseFloat(ticker.priceChangePercent) || 0;
  const price = parseFloat(ticker.lastPrice) || 0;
  const high = parseFloat(ticker.highPrice) || price;
  const low = parseFloat(ticker.lowPrice) || price;
  const midRange = (high + low) / 2;

  switch (modality) {
    case 'scalping':
    case 'swing':
    case 'breakout':
      return change >= 0 ? 'Long' : 'Short';
    case 'reversal':
      // Reversal: go against the trend
      return change >= 0 ? 'Short' : 'Long';
    case 'smc':
      return price > midRange ? 'Long' : 'Short';
    case 'fvg':
      return change >= 0 ? 'Long' : 'Short';
    default:
      return 'Long';
  }
}

// Open a new paper trade for a modality
async function openTradeForModality(modality: TradingModality, tickers: Map<string, BinanceTicker>): Promise<void> {
  // Get currently open trades to avoid duplicate symbols
  const openTrades = await getAllOpenTrades();
  const usedSymbols = openTrades.map(t => t.symbol);

  const symbol = selectBestSymbol(tickers, modality, usedSymbols);
  if (!symbol) return;

  const ticker = tickers.get(symbol);
  if (!ticker) return;

  const entryPrice = parseFloat(ticker.lastPrice);
  if (!entryPrice || entryPrice <= 0) return;

  const direction = determineDirection(ticker, modality);
  const config = MODALITY_CONFIG[modality];

  const tp1 = direction === 'Long'
    ? entryPrice * (1 + config.tpMult1)
    : entryPrice * (1 - config.tpMult1);
  const tp2 = direction === 'Long'
    ? entryPrice * (1 + config.tpMult2)
    : entryPrice * (1 - config.tpMult2);
  const tp3 = direction === 'Long'
    ? entryPrice * (1 + config.tpMult3)
    : entryPrice * (1 - config.tpMult3);
  const slLevel = direction === 'Long'
    ? entryPrice * (1 - config.slMult)
    : entryPrice * (1 + config.slMult);

  const trade: PaperTrade = {
    id: `${modality}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    symbol,
    modality,
    direction,
    entryPrice,
    currentPrice: entryPrice,
    tp1,
    tp2,
    tp3,
    slLevel,
    capital: PAPER_CAPITAL,
    leverage: PAPER_LEVERAGE,
    exposure: PAPER_CAPITAL * PAPER_LEVERAGE,
    pnlPercent: 0,
    pnlUsd: 0,
    openedAt: Date.now(),
    status: 'open',
  };

  await addOpenTrade(trade);
}

// Calculate PnL for a trade given current price
function calcPnl(trade: PaperTrade, currentPrice: number): { pnlPercent: number; pnlUsd: number } {
  const priceDiff = currentPrice - trade.entryPrice;
  const pnlPercent = trade.direction === 'Long'
    ? (priceDiff / trade.entryPrice) * 100 * trade.leverage
    : (-priceDiff / trade.entryPrice) * 100 * trade.leverage;
  const pnlUsd = (pnlPercent / 100) * trade.capital;
  return { pnlPercent, pnlUsd };
}

// Check if a trade should be closed
function checkExitCondition(trade: PaperTrade, currentPrice: number): 'TP1' | 'TP2' | 'TP3' | 'SL' | null {
  if (trade.direction === 'Long') {
    if (currentPrice >= trade.tp3) return 'TP3';
    if (currentPrice >= trade.tp2) return 'TP2';
    if (currentPrice >= trade.tp1) return 'TP1';
    if (currentPrice <= trade.slLevel) return 'SL';
  } else {
    if (currentPrice <= trade.tp3) return 'TP3';
    if (currentPrice <= trade.tp2) return 'TP2';
    if (currentPrice <= trade.tp1) return 'TP1';
    if (currentPrice >= trade.slLevel) return 'SL';
  }
  return null;
}

// Main engine loop
async function engineLoop(): Promise<void> {
  if (!engineRunning) return;

  try {
    const tickers = await fetchAllTickers();

    // Ensure each modality has exactly one open trade
    for (const modality of MODALITIES) {
      const existing = await getOpenTradeByModality(modality);
      if (!existing) {
        await openTradeForModality(modality, tickers);
      }
    }

    // Update prices and check exit conditions
    const openTrades = await getAllOpenTrades();
    for (const trade of openTrades) {
      const ticker = tickers.get(trade.symbol);
      if (!ticker) continue;

      const currentPrice = parseFloat(ticker.lastPrice);
      if (!currentPrice || currentPrice <= 0) continue;

      const exitReason = checkExitCondition(trade, currentPrice);

      if (exitReason) {
        await closeTradeAndArchive(trade.id, currentPrice, exitReason);
        // Immediately open next trade for this modality
        await openTradeForModality(trade.modality, tickers);
      } else {
        const { pnlPercent, pnlUsd } = calcPnl(trade, currentPrice);
        await updateTradePrice(trade.id, currentPrice, pnlPercent, pnlUsd);
      }
    }
  } catch (err) {
    // Silent fail - engine continues
  }

  if (engineRunning) {
    pollTimer = setTimeout(engineLoop, POLL_INTERVAL_MS);
  }
}

export async function startEngine(): Promise<void> {
  if (engineRunning) return;
  engineRunning = true;
  await initDB();
  // Load validated symbols in background
  fetchValidatedSymbols().then(symbols => {
    symbolUniverse = symbols;
  });
  engineLoop();
}

export function stopEngine(): void {
  engineRunning = false;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

export function isEngineRunning(): boolean {
  return engineRunning;
}

export { PAPER_CAPITAL, PAPER_LEVERAGE };
