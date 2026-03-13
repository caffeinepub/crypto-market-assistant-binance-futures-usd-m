import { a as createLucideIcon } from "./index-BMAOQGGr.js";
import { u as useQuery } from "./card-BIDaU0aL.js";
import { learningEngine } from "./learningEngine-DnDrJIqT.js";
import { b as fetchBinanceMarketData, c as filterMajorPairs, d as fetchBinanceAsset } from "./binanceFetch-CHtJR5Bx.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
async function calculateAdvancedTechnicalAnalysis(ticker) {
  const price = Number.parseFloat(ticker.lastPrice);
  const high = Number.parseFloat(ticker.highPrice);
  const low = Number.parseFloat(ticker.lowPrice);
  const open = Number.parseFloat(ticker.openPrice);
  const priceChange = Number.parseFloat(ticker.priceChangePercent);
  const volume = Number.parseFloat(ticker.quoteVolume);
  const tradeCount = ticker.count;
  const trend = priceChange >= 0 ? "bullish" : "bearish";
  const priceStrength = Math.min(Math.abs(priceChange) * 10, 50);
  const volumeStrength = Math.min(volume / 1e9 * 20, 30);
  const momentumStrength = price > open ? 20 : 0;
  const strength = Math.min(
    priceStrength + volumeStrength + momentumStrength,
    100
  );
  const range = high - low;
  const resistanceZones = [
    price + range * 0.236,
    price + range * 0.382,
    price + range * 0.618
  ].sort((a, b) => b - a);
  const supportZones = [
    price - range * 0.236,
    price - range * 0.382,
    price - range * 0.618
  ].sort((a, b) => b - a);
  const predictionFactor = trend === "bullish" ? 1 + priceChange / 200 : 1 + priceChange / 200;
  const prediction = price * predictionFactor;
  const volumeDelta = volume / 1e9;
  const priceVolatility = range / price;
  const tradeIntensity = tradeCount / 1e5;
  const volumeConfidence = Math.min(volumeDelta / 10, 0.4);
  const volatilityConfidence = Math.max(0, 0.3 - priceVolatility * 10);
  const tradeConfidence = Math.min(tradeIntensity / 5, 0.3);
  const baseConfidence = Math.min(
    Math.max(volumeConfidence + volatilityConfidence + tradeConfidence, 0.1),
    1
  );
  let learningLevel = 0;
  let optimizedConfidence = baseConfidence;
  try {
    await learningEngine.initialize();
    const stats = await learningEngine.getAssetStats(ticker.symbol);
    if (stats) {
      learningLevel = stats.learningLevel;
      optimizedConfidence = await learningEngine.getOptimizedConfidence(
        ticker.symbol,
        baseConfidence
      );
    }
  } catch (error) {
    console.error("Error getting learning stats:", error);
  }
  const manipulationZones = detectManipulationZones(
    volumeDelta,
    priceVolatility,
    priceChange,
    low,
    high,
    supportZones,
    resistanceZones
  );
  const institutionalOrders = detectInstitutionalOrders(
    volumeDelta,
    priceChange,
    price,
    open,
    low,
    high
  );
  const tags = generateAnalysisTags(
    optimizedConfidence,
    learningLevel,
    volumeDelta,
    priceChange,
    priceVolatility,
    manipulationZones,
    institutionalOrders,
    trend,
    strength
  );
  return {
    trend,
    strength,
    prediction,
    supportZones,
    resistanceZones,
    confidence: optimizedConfidence,
    tags,
    manipulationZones,
    institutionalOrders,
    learningLevel,
    optimizedConfidence
  };
}
function detectManipulationZones(volumeDelta, priceVolatility, priceChange, low, high, supportZones, resistanceZones) {
  const zones = [];
  if (volumeDelta > 5 && priceVolatility > 0.02) {
    zones.push({
      priceRange: { min: low, max: high },
      confidence: Math.min(volumeDelta / 10, 0.9)
    });
  }
  if (Math.abs(priceChange) > 3 && volumeDelta > 3) {
    zones.push({
      priceRange: { min: supportZones[0], max: resistanceZones[0] },
      confidence: Math.min((Math.abs(priceChange) + volumeDelta) / 15, 0.85)
    });
  }
  return zones;
}
function detectInstitutionalOrders(volumeDelta, priceChange, price, open, low, high) {
  const orders = [];
  if (volumeDelta > 8 && Math.abs(priceChange) < 2) {
    orders.push({
      direction: price > open ? "up" : "down",
      confidence: Math.min(volumeDelta / 12, 0.95),
      price: (open + price) / 2
    });
  }
  if (Math.abs(priceChange) > 5 && volumeDelta > 6) {
    orders.push({
      direction: priceChange > 0 ? "up" : "down",
      confidence: Math.min((Math.abs(priceChange) + volumeDelta) / 18, 0.9),
      price: (low + high) / 2
    });
  }
  return orders;
}
function generateAnalysisTags(optimizedConfidence, learningLevel, volumeDelta, priceChange, priceVolatility, manipulationZones, institutionalOrders, trend, strength) {
  const tags = [];
  if (optimizedConfidence > 0.7) tags.push("Alta Confiança");
  if (optimizedConfidence < 0.3) tags.push("Baixa Confiança");
  if (learningLevel > 0.7) tags.push("IA Avançada");
  if (learningLevel > 0.4 && learningLevel <= 0.7)
    tags.push("IA Intermediária");
  if (volumeDelta > 8) tags.push("Volume Institucional");
  if (Math.abs(priceChange) > 5) tags.push("Movimento Forte");
  if (priceVolatility > 0.03) tags.push("Alta Volatilidade");
  if (manipulationZones.length > 0) tags.push("Zona de Manipulação Detectada");
  if (institutionalOrders.length > 0)
    tags.push("Ordem Institucional Detectada");
  if (trend === "bullish" && strength > 70)
    tags.push("Forte Tendência de Alta");
  if (trend === "bearish" && strength > 70)
    tags.push("Forte Tendência de Baixa");
  if (volumeDelta > 5 && Math.abs(priceChange) < 1)
    tags.push("Acumulação/Distribuição");
  return tags;
}
async function recordPredictions(marketData, prioritization) {
  try {
    await learningEngine.initialize();
    const config = await learningEngine.getConfig();
    if (!config.enabled) return;
    let sortedMarketData = [...marketData];
    if ((prioritization == null ? void 0 : prioritization.enabled) && prioritization.favouriteSymbols.length > 0) {
      sortedMarketData = sortedMarketData.sort((a, b) => {
        const aIsFavourite = prioritization.favouriteSymbols.includes(a.symbol);
        const bIsFavourite = prioritization.favouriteSymbols.includes(b.symbol);
        if (aIsFavourite && !bIsFavourite) return -1;
        if (!aIsFavourite && bIsFavourite) return 1;
        return 0;
      });
    }
    for (const market of sortedMarketData) {
      const isFavourite = (prioritization == null ? void 0 : prioritization.enabled) && prioritization.favouriteSymbols.includes(market.symbol);
      const effectiveConfidenceThreshold = isFavourite ? config.confidenceThreshold * 0.8 : config.confidenceThreshold;
      if (market.analysis.confidence >= effectiveConfidenceThreshold) {
        await learningEngine.recordPrediction({
          symbol: market.symbol,
          timestamp: Date.now(),
          predictedPrice: market.analysis.prediction,
          confidence: market.analysis.confidence,
          indicators: {
            smc: market.analysis.strength / 100,
            volumeDelta: Number.parseFloat(market.quoteVolume) / 1e10,
            liquidity: (Number.parseFloat(market.highPrice) - Number.parseFloat(market.lowPrice)) / Number.parseFloat(market.lastPrice),
            fvg: Math.abs(market.priceChangePercent) / 10
          }
        });
      }
    }
  } catch (error) {
    console.error("Error recording predictions:", error);
  }
}
async function updatePastPredictions(marketData, prioritization) {
  try {
    await learningEngine.initialize();
    let sortedMarketData = [...marketData];
    if ((prioritization == null ? void 0 : prioritization.enabled) && prioritization.favouriteSymbols.length > 0) {
      sortedMarketData = sortedMarketData.sort((a, b) => {
        const aIsFavourite = prioritization.favouriteSymbols.includes(a.symbol);
        const bIsFavourite = prioritization.favouriteSymbols.includes(b.symbol);
        if (aIsFavourite && !bIsFavourite) return -1;
        if (!aIsFavourite && bIsFavourite) return 1;
        return 0;
      });
    }
    for (const market of sortedMarketData) {
      await learningEngine.updatePredictionResult(
        market.symbol,
        Date.now(),
        Number.parseFloat(market.lastPrice)
      );
      await learningEngine.updateAssetStats(market.symbol);
    }
  } catch (error) {
    console.error("Error updating past predictions:", error);
  }
}
function generateRecommendations(marketData) {
  const topBullish = marketData.filter(
    (m) => m.analysis.trend === "bullish" && m.analysis.strength > 50 && m.analysis.confidence > 0.4
  ).sort((a, b) => {
    const learningDiff = (b.analysis.learningLevel || 0) - (a.analysis.learningLevel || 0);
    if (Math.abs(learningDiff) > 0.1) return learningDiff;
    const confDiff = b.analysis.confidence - a.analysis.confidence;
    if (Math.abs(confDiff) > 0.1) return confDiff;
    return b.analysis.strength - a.analysis.strength;
  }).slice(0, 15).map((market) => ({
    symbol: market.symbol,
    strength: market.analysis.strength,
    confidence: market.analysis.confidence,
    timestamp: Date.now()
  }));
  return topBullish;
}
function getLearningPrioritization() {
  try {
    const enabled = localStorage.getItem("prioritize-favourites-learning") === "true";
    const favouritesStr = localStorage.getItem("favourite-assets");
    const favouriteSymbols = favouritesStr ? JSON.parse(favouritesStr) : [];
    return {
      enabled: enabled && favouriteSymbols.length > 0,
      favouriteSymbols
    };
  } catch (error) {
    console.warn("Error reading learning prioritization settings:", error);
    return { enabled: false, favouriteSymbols: [] };
  }
}
function useBinanceMarketData() {
  return useQuery({
    queryKey: ["binance-market-data-browser"],
    queryFn: async () => {
      try {
        const rawData = await fetchBinanceMarketData();
        const majorPairs = filterMajorPairs(rawData);
        if (majorPairs.length === 0) {
          throw new Error("No market data available from Binance");
        }
        const enriched = await Promise.all(
          majorPairs.map(async (ticker) => {
            try {
              const analysis = await calculateAdvancedTechnicalAnalysis(ticker);
              const marketData = {
                symbol: ticker.symbol,
                priceChange: Number.parseFloat(ticker.priceChange),
                priceChangePercent: Number.parseFloat(
                  ticker.priceChangePercent
                ),
                weightedAvgPrice: Number.parseFloat(ticker.weightedAvgPrice),
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
                analysis
              };
              return marketData;
            } catch (error) {
              console.error(`Error enriching ${ticker.symbol}:`, error);
              const fallbackAnalysis = {
                trend: "bullish",
                strength: 0,
                prediction: Number.parseFloat(ticker.lastPrice),
                supportZones: [],
                resistanceZones: [],
                confidence: 0,
                tags: [],
                manipulationZones: [],
                institutionalOrders: []
              };
              return {
                symbol: ticker.symbol,
                priceChange: Number.parseFloat(ticker.priceChange),
                priceChangePercent: Number.parseFloat(
                  ticker.priceChangePercent
                ),
                weightedAvgPrice: Number.parseFloat(ticker.weightedAvgPrice),
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
                analysis: fallbackAnalysis
              };
            }
          })
        );
        const prioritization = getLearningPrioritization();
        try {
          await recordPredictions(enriched, prioritization);
          await updatePastPredictions(enriched, prioritization);
        } catch (learningError) {
          console.warn("Learning engine error (non-critical):", learningError);
        }
        return enriched;
      } catch (error) {
        console.error("Error fetching Binance market data:", error);
        if (error instanceof Error) {
          if (error.message.includes("blocked") || error.message.includes("restricted")) {
            throw new Error(`Binance access blocked: ${error.message}`);
          }
          throw new Error(`Live market data unavailable: ${error.message}`);
        }
        throw new Error(
          "Live market data unavailable. Unable to fetch from Binance API."
        );
      }
    },
    refetchInterval: 3e4,
    // Refresh every 30 seconds
    staleTime: 2e4,
    // Consider data stale after 20 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 1e4),
    placeholderData: void 0
  });
}
function useSearchBinanceAsset(symbol) {
  return useQuery({
    queryKey: ["binance-asset-search", symbol],
    queryFn: async () => {
      try {
        const ticker = await fetchBinanceAsset(symbol);
        const analysis = await calculateAdvancedTechnicalAnalysis(ticker);
        const enrichedData = {
          symbol: ticker.symbol,
          priceChange: Number.parseFloat(ticker.priceChange),
          priceChangePercent: Number.parseFloat(ticker.priceChangePercent),
          weightedAvgPrice: Number.parseFloat(ticker.weightedAvgPrice),
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
          analysis
        };
        return enrichedData;
      } catch (error) {
        console.error("Error searching for asset:", error);
        return null;
      }
    },
    enabled: symbol.length > 0,
    staleTime: 3e4
  });
}
function useRecommendations() {
  const { data: marketData } = useBinanceMarketData();
  return useQuery({
    queryKey: ["recommendations", marketData == null ? void 0 : marketData.length],
    queryFn: () => {
      if (!marketData) return [];
      return generateRecommendations(marketData);
    },
    enabled: !!marketData,
    staleTime: 3e4
  });
}
export {
  TriangleAlert as T,
  useRecommendations as a,
  useSearchBinanceAsset as b,
  useBinanceMarketData as u
};
