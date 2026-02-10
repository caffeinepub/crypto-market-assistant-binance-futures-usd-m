import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useEffect, useRef } from 'react';
import { learningEngine } from '@/lib/learningEngine';
import { fetchBinanceAsset, fetchBinanceMarketData, filterMajorPairs } from './queries/binanceFetch';
import { calculateAdvancedTechnicalAnalysis } from './queries/analysisEnrichment';
import { generateRecommendations, generateRadarAlerts, ExtendedRadarAlert, AnomalyType } from './queries/localSignals';
import { recordPredictions, updatePastPredictions, LearningPrioritization } from './queries/learningIntegration';

// Type definitions
export type Trend = 'bullish' | 'bearish' | 'all';
export type DirectionType = 'up' | 'down';

export interface PriceRange {
  min: number;
  max: number;
}

export interface ManipulationZone {
  priceRange: PriceRange;
  confidence: number;
}

export interface InstitutionalOrder {
  direction: DirectionType;
  confidence: number;
  price: number;
}

export interface RadarAlert {
  symbol: string;
  percentChange: number;
  volumeDelta: number;
  direction: DirectionType;
  confidence: number;
  anomalyScore: number;
  anomalyTypes: AnomalyType[];
  reasons: string[];
  timestamp: number;
}

export interface Recommendation {
  symbol: string;
  strength: number;
  confidence: number;
  timestamp: number;
}

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

export interface TechnicalAnalysis {
  trend: 'bullish' | 'bearish';
  strength: number;
  prediction: number;
  supportZones: number[];
  resistanceZones: number[];
  confidence: number;
  tags: string[];
  manipulationZones: ManipulationZone[];
  institutionalOrders: InstitutionalOrder[];
  learningLevel?: number;
  optimizedConfidence?: number;
}

export interface BinanceMarketData {
  symbol: string;
  priceChange: number;
  priceChangePercent: number;
  weightedAvgPrice: number;
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
  analysis: TechnicalAnalysis;
}

export interface DataStatus {
  isStale: boolean;
  hasError: boolean;
  errorMessage?: string;
  lastUpdate?: number;
  provider: string;
  isFetching: boolean;
}

/**
 * Helper to read learning prioritization settings from localStorage
 */
function getLearningPrioritization(): LearningPrioritization {
  try {
    const enabled = localStorage.getItem('prioritize-favourites-learning') === 'true';
    const favouritesStr = localStorage.getItem('favourite-assets');
    const favouriteSymbols = favouritesStr ? JSON.parse(favouritesStr) : [];
    
    return {
      enabled: enabled && favouriteSymbols.length > 0,
      favouriteSymbols,
    };
  } catch (error) {
    console.warn('Error reading learning prioritization settings:', error);
    return { enabled: false, favouriteSymbols: [] };
  }
}

/**
 * Fetch Binance Futures USD-M market data directly from Binance (browser)
 * This is the primary data source for real-time market information
 */
export function useBinanceMarketData() {
  return useQuery<BinanceMarketData[], Error>({
    queryKey: ['binance-market-data-browser'],
    queryFn: async (): Promise<BinanceMarketData[]> => {
      try {
        // Fetch directly from Binance API in the browser
        const rawData = await fetchBinanceMarketData();
        
        // Filter for major pairs
        const majorPairs = filterMajorPairs(rawData);
        
        if (majorPairs.length === 0) {
          throw new Error('No market data available from Binance');
        }

        // Enrich with technical analysis
        const enriched: BinanceMarketData[] = await Promise.all(
          majorPairs.map(async (ticker): Promise<BinanceMarketData> => {
            try {
              const analysis = await calculateAdvancedTechnicalAnalysis(ticker);

              const marketData: BinanceMarketData = {
                symbol: ticker.symbol,
                priceChange: parseFloat(ticker.priceChange),
                priceChangePercent: parseFloat(ticker.priceChangePercent),
                weightedAvgPrice: parseFloat(ticker.weightedAvgPrice),
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

              return marketData;
            } catch (error) {
              console.error(`Error enriching ${ticker.symbol}:`, error);
              // Return basic data without analysis on enrichment failure
              const fallbackAnalysis: TechnicalAnalysis = {
                trend: 'bullish' as const,
                strength: 0,
                prediction: parseFloat(ticker.lastPrice),
                supportZones: [],
                resistanceZones: [],
                confidence: 0,
                tags: [],
                manipulationZones: [],
                institutionalOrders: [],
              };

              return {
                symbol: ticker.symbol,
                priceChange: parseFloat(ticker.priceChange),
                priceChangePercent: parseFloat(ticker.priceChangePercent),
                weightedAvgPrice: parseFloat(ticker.weightedAvgPrice),
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
                analysis: fallbackAnalysis,
              };
            }
          })
        );

        // Read learning prioritization settings
        const prioritization = getLearningPrioritization();

        // Record predictions and update past predictions for learning
        try {
          await recordPredictions(enriched, prioritization);
          await updatePastPredictions(enriched, prioritization);
        } catch (learningError) {
          console.warn('Learning engine error (non-critical):', learningError);
          // Don't fail the query if learning fails
        }

        return enriched;
      } catch (error) {
        console.error('Error fetching Binance market data:', error);
        
        // Provide clear, actionable error message
        if (error instanceof Error) {
          // Check if it's a blocked/restricted error
          if (error.message.includes('blocked') || error.message.includes('restricted')) {
            throw new Error(`Binance access blocked: ${error.message}`);
          }
          throw new Error(`Live market data unavailable: ${error.message}`);
        }
        
        throw new Error('Live market data unavailable. Unable to fetch from Binance API.');
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // Do NOT keep previous data on error - we want explicit error states
    placeholderData: undefined,
  });
}

/**
 * Get data status with provider and freshness information
 */
export function useDataStatus(): DataStatus {
  const { data, error, dataUpdatedAt, isFetching } = useBinanceMarketData();
  
  const now = Date.now();
  const lastUpdate = dataUpdatedAt || 0;
  const ageMs = now - lastUpdate;
  
  // Data is stale if older than 2 minutes
  const isStale = lastUpdate > 0 && ageMs > 120000;

  return {
    isStale,
    hasError: !!error,
    errorMessage: error?.message,
    lastUpdate: lastUpdate > 0 ? lastUpdate : undefined,
    provider: 'Binance (browser)',
    isFetching,
  };
}

/**
 * Search for a specific Binance asset and apply full technical analysis
 */
export function useSearchBinanceAsset(symbol: string) {
  return useQuery<BinanceMarketData | null>({
    queryKey: ['binance-asset-search', symbol],
    queryFn: async () => {
      try {
        const ticker = await fetchBinanceAsset(symbol);
        const analysis = await calculateAdvancedTechnicalAnalysis(ticker);

        const enrichedData: BinanceMarketData = {
          symbol: ticker.symbol,
          priceChange: parseFloat(ticker.priceChange),
          priceChangePercent: parseFloat(ticker.priceChangePercent),
          weightedAvgPrice: parseFloat(ticker.weightedAvgPrice),
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

        // Read learning prioritization settings
        const prioritization = getLearningPrioritization();

        // Record prediction for learning
        await recordPredictions([enrichedData], prioritization);

        return enrichedData;
      } catch (error) {
        console.error(`Error fetching asset ${symbol}:`, error);
        return null;
      }
    },
    enabled: !!symbol,
    staleTime: 20000,
  });
}

/**
 * Get recommendations (generated locally from market data)
 */
export function useRecommendations() {
  const { data: marketData, error } = useBinanceMarketData();

  return useQuery<Recommendation[]>({
    queryKey: ['recommendations', marketData],
    queryFn: async () => {
      if (!marketData || marketData.length === 0) return [];

      try {
        return generateRecommendations(marketData);
      } catch (error) {
        console.error('Error generating recommendations:', error);
        throw error;
      }
    },
    enabled: !!marketData && !error,
    refetchInterval: 30000,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Auto-generate recommendations based on market data
 */
export function useAutoGenerateRecommendations() {
  const { data: marketData } = useBinanceMarketData();
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!marketData || marketData.length === 0) return;

    try {
      const recommendations = generateRecommendations(marketData);

      // Track processed recommendations
      recommendations.forEach((rec) => {
        const key = `${rec.symbol}-${Math.floor(Date.now() / 60000)}`;
        processedRef.current.add(key);
      });

      // Clean up old entries (keep last 100)
      if (processedRef.current.size > 100) {
        const entries = Array.from(processedRef.current);
        processedRef.current = new Set(entries.slice(-50));
      }
    } catch (error) {
      console.warn('Error auto-generating recommendations:', error);
    }
  }, [marketData]);
}

/**
 * Get radar alerts (generated locally from market data with extended anomaly detection)
 */
export function useRadarAlerts() {
  const { data: marketData, error } = useBinanceMarketData();

  return useQuery<RadarAlert[]>({
    queryKey: ['radar-alerts', marketData],
    queryFn: async () => {
      if (!marketData || marketData.length === 0) return [];

      try {
        const extendedAlerts = await generateRadarAlerts(marketData);
        // Convert ExtendedRadarAlert to RadarAlert (they're compatible)
        return extendedAlerts;
      } catch (error) {
        console.error('Error generating radar alerts:', error);
        // Return empty array on error to prevent UI crashes
        return [];
      }
    },
    enabled: !!marketData && !error,
    refetchInterval: 30000,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Auto-detect and track radar alerts based on market data
 */
export function useAutoDetectRadarAlerts() {
  const { data: marketData } = useBinanceMarketData();
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!marketData || marketData.length === 0) return;

    const detectAlerts = async () => {
      try {
        const alerts = await generateRadarAlerts(marketData);

        alerts.forEach((alert) => {
          const key = `${alert.symbol}-${Math.floor(Date.now() / 60000)}`;
          if (!processedRef.current.has(key)) {
            processedRef.current.add(key);
          }
        });

        // Clean up old entries
        if (processedRef.current.size > 100) {
          const entries = Array.from(processedRef.current);
          processedRef.current = new Set(entries.slice(-50));
        }
      } catch (error) {
        console.warn('Error auto-detecting radar alerts:', error);
      }
    };

    detectAlerts();
  }, [marketData]);
}

/**
 * Get high learning assets
 */
export function useHighLearningAssets() {
  return useQuery<string[]>({
    queryKey: ['high-learning-assets'],
    queryFn: async () => {
      try {
        await learningEngine.initialize();
        return await learningEngine.getHighLearningAssets(0.6);
      } catch (error) {
        console.error('Error getting high learning assets:', error);
        return [];
      }
    },
    refetchInterval: 60000,
  });
}
