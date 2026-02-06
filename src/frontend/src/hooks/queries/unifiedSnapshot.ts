import { UnifiedSnapshot } from '@/backend';
import { BinanceMarketData, TechnicalAnalysis, BinanceTicker } from '../useQueries';
import { calculateAdvancedTechnicalAnalysis } from './analysisEnrichment';

export interface SnapshotMetadata {
  serverTime: bigint;
  isStale: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export interface EnrichedSnapshot {
  marketData: BinanceMarketData[];
  metadata: SnapshotMetadata;
}

/**
 * Safely convert a value to a finite number, returning a default if invalid
 */
function toSafeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'bigint') {
    try {
      const num = Number(value);
      return Number.isFinite(num) ? num : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : defaultValue;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }
  
  return defaultValue;
}

/**
 * Transform backend UnifiedSnapshot into frontend-compatible BinanceMarketData format
 */
export async function transformUnifiedSnapshot(
  snapshot: UnifiedSnapshot
): Promise<EnrichedSnapshot> {
  try {
    // Validate snapshot structure
    if (!snapshot || typeof snapshot !== 'object') {
      throw new Error('Invalid snapshot: snapshot is null or not an object');
    }

    if (!Array.isArray(snapshot.marketData)) {
      throw new Error('Invalid snapshot: marketData is not an array');
    }

    if (typeof snapshot.timestamp !== 'bigint' && typeof snapshot.timestamp !== 'number') {
      throw new Error('Invalid snapshot: timestamp is missing or invalid');
    }

    const metadata: SnapshotMetadata = {
      serverTime: typeof snapshot.timestamp === 'bigint' ? snapshot.timestamp : BigInt(snapshot.timestamp),
      isStale: false,
      hasError: false,
    };

    // Transform backend MarketData to BinanceTicker format for analysis
    const tickers: BinanceTicker[] = snapshot.marketData
      .filter((item) => {
        // Validate each market data item
        return (
          item &&
          typeof item === 'object' &&
          typeof item.symbol === 'string' &&
          item.symbol.length > 0 &&
          (typeof item.price === 'number' || typeof item.price === 'bigint') &&
          (typeof item.volume === 'number' || typeof item.volume === 'bigint')
        );
      })
      .map((item) => {
        const price = toSafeNumber(item.price, 0);
        const volume = toSafeNumber(item.volume, 0);
        const timestampMs = Number(metadata.serverTime / 1000000n);

        return {
          symbol: item.symbol,
          priceChange: '0',
          priceChangePercent: '0',
          weightedAvgPrice: price.toString(),
          lastPrice: price.toString(),
          lastQty: '0',
          openPrice: price.toString(),
          highPrice: price.toString(),
          lowPrice: price.toString(),
          volume: volume.toString(),
          quoteVolume: (volume * price).toString(),
          openTime: timestampMs,
          closeTime: timestampMs,
          count: 0,
        };
      });

    // Enrich with technical analysis
    const enrichedData: BinanceMarketData[] = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const analysis = await calculateAdvancedTechnicalAnalysis(ticker);

          return {
            symbol: ticker.symbol,
            priceChange: toSafeNumber(ticker.priceChange, 0),
            priceChangePercent: toSafeNumber(ticker.priceChangePercent, 0),
            weightedAvgPrice: toSafeNumber(ticker.weightedAvgPrice, 0),
            lastPrice: ticker.lastPrice,
            lastQty: ticker.lastQty,
            openPrice: ticker.openPrice,
            highPrice: ticker.highPrice,
            lowPrice: ticker.lowPrice,
            volume: ticker.volume,
            quoteVolume: ticker.quoteVolume,
            openTime: ticker.openTime,
            closeTime: ticker.closeTime,
            count: ticker.count,
            analysis,
          };
        } catch (error) {
          console.error(`Error enriching ${ticker.symbol}:`, error);
          // Return a safe fallback with minimal analysis
          return {
            symbol: ticker.symbol,
            priceChange: 0,
            priceChangePercent: 0,
            weightedAvgPrice: toSafeNumber(ticker.weightedAvgPrice, 0),
            lastPrice: ticker.lastPrice,
            lastQty: ticker.lastQty,
            openPrice: ticker.openPrice,
            highPrice: ticker.highPrice,
            lowPrice: ticker.lowPrice,
            volume: ticker.volume,
            quoteVolume: ticker.quoteVolume,
            openTime: ticker.openTime,
            closeTime: ticker.closeTime,
            count: ticker.count,
            analysis: {
              trend: 'bullish',
              strength: 0,
              prediction: toSafeNumber(ticker.lastPrice, 0),
              supportZones: [],
              resistanceZones: [],
              confidence: 0,
              tags: [],
              manipulationZones: [],
              institutionalOrders: [],
            },
          };
        }
      })
    );

    return {
      marketData: enrichedData,
      metadata,
    };
  } catch (error) {
    console.error('Error transforming unified snapshot:', error);
    throw new Error(
      `Frontend-backend interface mismatch: ${error instanceof Error ? error.message : 'Unknown transformation error'}. Please reload the page to clear stale cache.`
    );
  }
}

/**
 * Check if snapshot data is stale based on timestamp
 */
export function isSnapshotStale(timestamp: bigint, maxAgeMs: number = 120000): boolean {
  try {
    const now = BigInt(Date.now() * 1000000); // Convert to nanoseconds
    const age = Number((now - timestamp) / 1000000n); // Convert to milliseconds
    return age > maxAgeMs;
  } catch (error) {
    console.error('Error checking snapshot staleness:', error);
    return true; // Assume stale on error
  }
}
