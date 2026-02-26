import type { Candle } from './smcIndicators';

export interface RSIResult {
  values: (number | null)[];
  current: number | null;
  signal: 'overbought' | 'oversold' | 'neutral';
}

export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
  current: {
    macd: number | null;
    signal: number | null;
    histogram: number | null;
  };
  crossover: 'bullish' | 'bearish' | 'none';
}

export interface MovingAverageResult {
  ema20: (number | null)[];
  ema50: (number | null)[];
  ema200: (number | null)[];
  sma50: (number | null)[];
  sma200: (number | null)[];
  current: {
    ema20: number | null;
    ema50: number | null;
    ema200: number | null;
    sma50: number | null;
    sma200: number | null;
  };
  alignment: 'bullish' | 'bearish' | 'mixed';
}

export interface BollingerBandsResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
  current: {
    upper: number | null;
    middle: number | null;
    lower: number | null;
    bandwidth: number | null;
    position: 'upper' | 'middle' | 'lower' | 'unknown';
  };
}

export interface TechnicalIndicatorsResult {
  rsi: RSIResult;
  macd: MACDResult;
  movingAverages: MovingAverageResult;
  bollingerBands: BollingerBandsResult;
}

function calculateEMA(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return result;

  const multiplier = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result[period - 1] = ema;

  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
    result[i] = ema;
  }

  return result;
}

function calculateSMA(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i++) {
    const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result[i] = sum / period;
  }
  return result;
}

export function calculateRSI(candles: Candle[], period = 14): RSIResult {
  const closes = candles.map(c => c.close);
  const result: (number | null)[] = new Array(closes.length).fill(null);

  if (closes.length < period + 1) {
    return { values: result, current: null, signal: 'neutral' };
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }

  avgGain /= period;
  avgLoss /= period;

  if (avgLoss === 0) {
    result[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    result[period] = 100 - 100 / (1 + rs);
  }

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      result[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      result[i] = 100 - 100 / (1 + rs);
    }
  }

  const current = result[result.length - 1];
  let signal: 'overbought' | 'oversold' | 'neutral' = 'neutral';
  if (current !== null) {
    if (current >= 70) signal = 'overbought';
    else if (current <= 30) signal = 'oversold';
  }

  return { values: result, current, signal };
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult {
  const closes = candles.map(c => c.close);
  const ema12 = calculateEMA(closes, fastPeriod);
  const ema26 = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = closes.map((_, i) => {
    if (ema12[i] === null || ema26[i] === null) return null;
    return (ema12[i] as number) - (ema26[i] as number);
  });

  const macdValues = macdLine.filter(v => v !== null) as number[];
  const macdSignalRaw = calculateEMA(macdValues, signalPeriod);

  const signalLine: (number | null)[] = new Array(closes.length).fill(null);
  let macdIdx = 0;
  for (let i = 0; i < closes.length; i++) {
    if (macdLine[i] !== null) {
      signalLine[i] = macdSignalRaw[macdIdx] ?? null;
      macdIdx++;
    }
  }

  const histogram: (number | null)[] = closes.map((_, i) => {
    if (macdLine[i] === null || signalLine[i] === null) return null;
    return (macdLine[i] as number) - (signalLine[i] as number);
  });

  const lastIdx = closes.length - 1;
  const prevIdx = closes.length - 2;

  let crossover: 'bullish' | 'bearish' | 'none' = 'none';
  if (
    histogram[lastIdx] !== null &&
    histogram[prevIdx] !== null
  ) {
    const curr = histogram[lastIdx] as number;
    const prev = histogram[prevIdx] as number;
    if (curr > 0 && prev <= 0) crossover = 'bullish';
    else if (curr < 0 && prev >= 0) crossover = 'bearish';
  }

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
    current: {
      macd: macdLine[lastIdx],
      signal: signalLine[lastIdx],
      histogram: histogram[lastIdx],
    },
    crossover,
  };
}

export function calculateMovingAverages(candles: Candle[]): MovingAverageResult {
  const closes = candles.map(c => c.close);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);

  const last = closes.length - 1;
  const current = {
    ema20: ema20[last],
    ema50: ema50[last],
    ema200: ema200[last],
    sma50: sma50[last],
    sma200: sma200[last],
  };

  const currentPrice = closes[last];
  let bullishCount = 0;
  let bearishCount = 0;

  const mas = [current.ema20, current.ema50, current.ema200, current.sma50, current.sma200];
  for (const ma of mas) {
    if (ma !== null) {
      if (currentPrice > ma) bullishCount++;
      else bearishCount++;
    }
  }

  let alignment: 'bullish' | 'bearish' | 'mixed' = 'mixed';
  if (bullishCount > bearishCount + 1) alignment = 'bullish';
  else if (bearishCount > bullishCount + 1) alignment = 'bearish';

  return { ema20, ema50, ema200, sma50, sma200, current, alignment };
}

export function calculateBollingerBands(
  candles: Candle[],
  period = 20,
  stdDevMultiplier = 2
): BollingerBandsResult {
  const closes = candles.map(c => c.close);
  const upper: (number | null)[] = new Array(closes.length).fill(null);
  const middle: (number | null)[] = new Array(closes.length).fill(null);
  const lower: (number | null)[] = new Array(closes.length).fill(null);

  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    middle[i] = sma;
    upper[i] = sma + stdDevMultiplier * stdDev;
    lower[i] = sma - stdDevMultiplier * stdDev;
  }

  const last = closes.length - 1;
  const currentPrice = closes[last];
  const u = upper[last];
  const m = middle[last];
  const l = lower[last];

  let position: 'upper' | 'middle' | 'lower' | 'unknown' = 'unknown';
  if (u !== null && m !== null && l !== null) {
    const bandwidth = u - l;
    if (currentPrice >= m + (u - m) * 0.5) position = 'upper';
    else if (currentPrice <= m - (m - l) * 0.5) position = 'lower';
    else position = 'middle';
  }

  const bandwidth = u !== null && l !== null ? u - l : null;

  return {
    upper,
    middle,
    lower,
    current: { upper: u, middle: m, lower: l, bandwidth, position },
  };
}

export function calculateAllIndicators(candles: Candle[]): TechnicalIndicatorsResult {
  return {
    rsi: calculateRSI(candles),
    macd: calculateMACD(candles),
    movingAverages: calculateMovingAverages(candles),
    bollingerBands: calculateBollingerBands(candles),
  };
}
