import type { BinanceMarketData } from "../hooks/useQueries";

export interface AltaProfile {
  avgVolumeRatio: number;
  avgDistFromOpen: number;
  avgVolatility: number;
  avgPriceNearHigh: number;
  stdVolume: number;
  stdDistFromOpen: number;
  stdVolatility: number;
  sampleSize: number;
}

export interface AltaCandidate {
  symbol: string;
  lastPrice: string;
  priceChangePercent: number;
  score: number;
  reasons: string[];
  metrics: {
    volumeRatio: number;
    distFromOpen: number;
    volatility: number;
    priceNearHigh: number;
    greenCandle: boolean;
    compression: boolean;
    nearResistance: boolean;
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Extract raw metrics from a market data asset
 */
function extractMetrics(asset: BinanceMarketData, medianVolume: number) {
  const price = Number.parseFloat(asset.lastPrice);
  const high = Number.parseFloat(asset.highPrice);
  const low = Number.parseFloat(asset.lowPrice);
  const open = Number.parseFloat(asset.openPrice);
  const volume = Number.parseFloat(asset.quoteVolume);

  const range = high - low;
  const volatility = price > 0 ? range / price : 0;
  const distFromOpen = open > 0 ? (price - open) / open : 0;
  const volumeRatio = medianVolume > 0 ? volume / medianVolume : 1;
  const priceNearHigh = range > 0 ? (high - price) / range : 0.5;
  const greenCandle = price > open;
  // Price compression: tight range relative to price (< 2%)
  const compression = volatility < 0.02 && greenCandle;
  // Near resistance: within top 10% of daily range
  const nearResistance = priceNearHigh < 0.1;

  return {
    volumeRatio,
    distFromOpen,
    volatility,
    priceNearHigh,
    greenCandle,
    compression,
    nearResistance,
    volume,
  };
}

/**
 * Build the statistical profile of assets that already had a significant spike.
 * These represent the "explosion pattern" we want to find in other assets.
 */
export function buildAltaProfile(
  marketData: BinanceMarketData[],
  threshold = 8,
): AltaProfile {
  const medianVol = median(
    marketData.map((a) => Number.parseFloat(a.quoteVolume)),
  );

  // Assets that already spiked
  const spiked = marketData.filter((a) => a.priceChangePercent >= threshold);

  if (spiked.length < 3) {
    // Fallback: use top 5% by change
    const sorted = [...marketData].sort(
      (a, b) => b.priceChangePercent - a.priceChangePercent,
    );
    spiked.push(
      ...sorted.slice(0, Math.max(5, Math.floor(sorted.length * 0.05))),
    );
  }

  const metrics = spiked.map((a) => extractMetrics(a, medianVol));

  const volRatios = metrics.map((m) => m.volumeRatio);
  const distValues = metrics.map((m) => Math.abs(m.distFromOpen));
  const volatValues = metrics.map((m) => m.volatility);

  const avgVolRatio = average(volRatios);
  const avgDist = average(distValues);
  const avgVolat = average(volatValues);

  return {
    avgVolumeRatio: avgVolRatio,
    avgDistFromOpen: avgDist,
    avgVolatility: avgVolat,
    avgPriceNearHigh: average(metrics.map((m) => m.priceNearHigh)),
    stdVolume: stdDev(volRatios, avgVolRatio),
    stdDistFromOpen: stdDev(distValues, avgDist),
    stdVolatility: stdDev(volatValues, avgVolat),
    sampleSize: spiked.length,
  };
}

/**
 * Score similarity of an asset to the alta profile.
 * Returns a score from 0 to 1. Score > 0.7 = strong candidate.
 *
 * score =
 *   (volumeAtual / volumeMédioAntesAlta) * 0.4 +
 *   (distânciaDaMédia / padrão_médio) * 0.3 +
 *   (volatilidade / volatilidade_média) * 0.3
 */
function computeScore(
  metrics: ReturnType<typeof extractMetrics>,
  profile: AltaProfile,
): number {
  const safeDiv = (a: number, b: number) => (b > 0 ? Math.min(a / b, 2) : 0);

  const volScore = safeDiv(metrics.volumeRatio, profile.avgVolumeRatio) * 0.4;
  const distScore =
    safeDiv(Math.abs(metrics.distFromOpen), profile.avgDistFromOpen) * 0.3;
  const volatScore = safeDiv(metrics.volatility, profile.avgVolatility) * 0.3;

  // Normalize: if ratio is 1.0 (exactly like the profile), score contribution is at max weight
  // We cap each component to its weight so total max = 1.0
  const rawScore =
    Math.min(volScore, 0.4) +
    Math.min(distScore, 0.3) +
    Math.min(volatScore, 0.3);

  return Math.round(rawScore * 100) / 100;
}

/**
 * Find assets with potential for an upcoming price explosion.
 * Filters out assets that already spiked (priceChangePercent > threshold).
 */
export function detectAltaCandidates(
  marketData: BinanceMarketData[],
  profile: AltaProfile,
  threshold = 8,
  minScore = 0.55,
): AltaCandidate[] {
  const medianVol = median(
    marketData.map((a) => Number.parseFloat(a.quoteVolume)),
  );

  // Only consider assets that have NOT yet exploded
  const candidates = marketData.filter(
    (a) => a.priceChangePercent < threshold && a.priceChangePercent > -5,
  );

  const results: AltaCandidate[] = [];

  for (const asset of candidates) {
    const m = extractMetrics(asset, medianVol);
    const score = computeScore(m, profile);

    if (score < minScore) continue;

    const reasons: string[] = [];

    if (m.volumeRatio > profile.avgVolumeRatio * 0.8) {
      reasons.push(`Volume ${(m.volumeRatio).toFixed(1)}x acima da média`);
    }
    if (m.distFromOpen > 0 && m.distFromOpen > profile.avgDistFromOpen * 0.7) {
      reasons.push(`+${(m.distFromOpen * 100).toFixed(1)}% vs abertura`);
    }
    if (m.greenCandle) {
      reasons.push("Candle de alta");
    }
    if (m.nearResistance) {
      reasons.push("Próximo da resistência 24h");
    }
    if (m.compression) {
      reasons.push("Compressão de preço detectada");
    }
    if (m.volatility > profile.avgVolatility * 0.8) {
      reasons.push(
        `Volatilidade elevada (${(m.volatility * 100).toFixed(1)}%)`,
      );
    }
    if (m.volumeRatio > profile.avgVolumeRatio * 1.5) {
      reasons.push("Aceleração de volume");
    }

    if (reasons.length === 0) reasons.push("Perfil estatístico similar");

    results.push({
      symbol: asset.symbol,
      lastPrice: asset.lastPrice,
      priceChangePercent: asset.priceChangePercent,
      score,
      reasons,
      metrics: {
        volumeRatio: m.volumeRatio,
        distFromOpen: m.distFromOpen,
        volatility: m.volatility,
        priceNearHigh: m.priceNearHigh,
        greenCandle: m.greenCandle,
        compression: m.compression,
        nearResistance: m.nearResistance,
      },
    });
  }

  // Sort by score descending, then by symbol for stability
  return results
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : a.symbol.localeCompare(b.symbol),
    )
    .slice(0, 20);
}
