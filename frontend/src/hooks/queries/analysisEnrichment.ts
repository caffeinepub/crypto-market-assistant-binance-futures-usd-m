import { BinanceTicker, TechnicalAnalysis, ManipulationZone, InstitutionalOrder } from '../useQueries';
import { learningEngine } from '@/lib/learningEngine';

/**
 * Calculate advanced technical analysis with confidence scoring and institutional detection
 */
export async function calculateAdvancedTechnicalAnalysis(ticker: BinanceTicker): Promise<TechnicalAnalysis> {
  const price = parseFloat(ticker.lastPrice);
  const high = parseFloat(ticker.highPrice);
  const low = parseFloat(ticker.lowPrice);
  const open = parseFloat(ticker.openPrice);
  const priceChange = parseFloat(ticker.priceChangePercent);
  const volume = parseFloat(ticker.quoteVolume);
  const tradeCount = ticker.count;

  // Determine trend based on price action
  const trend: 'bullish' | 'bearish' = priceChange >= 0 ? 'bullish' : 'bearish';

  // Calculate strength (0-100) based on multiple factors
  const priceStrength = Math.min(Math.abs(priceChange) * 10, 50);
  const volumeStrength = Math.min((volume / 1000000000) * 20, 30);
  const momentumStrength = price > open ? 20 : 0;
  const strength = Math.min(priceStrength + volumeStrength + momentumStrength, 100);

  // Calculate support and resistance zones using Fibonacci-like levels
  const range = high - low;
  const resistanceZones = [
    price + range * 0.236,
    price + range * 0.382,
    price + range * 0.618,
  ].sort((a, b) => b - a);

  const supportZones = [
    price - range * 0.236,
    price - range * 0.382,
    price - range * 0.618,
  ].sort((a, b) => b - a);

  // Predict next price based on trend and momentum
  const predictionFactor = trend === 'bullish' ? 1 + priceChange / 200 : 1 + priceChange / 200;
  const prediction = price * predictionFactor;

  // Advanced: Calculate confidence level (0-1) based on multiple indicators
  const volumeDelta = volume / 1000000000;
  const priceVolatility = range / price;
  const tradeIntensity = tradeCount / 100000;
  
  // SMC-based confidence: higher volume + lower volatility + consistent trades = higher confidence
  const volumeConfidence = Math.min(volumeDelta / 10, 0.4);
  const volatilityConfidence = Math.max(0, 0.3 - priceVolatility * 10);
  const tradeConfidence = Math.min(tradeIntensity / 5, 0.3);
  
  const baseConfidence = Math.min(Math.max(volumeConfidence + volatilityConfidence + tradeConfidence, 0.1), 1.0);

  // Get learning stats and optimize confidence
  let learningLevel = 0;
  let optimizedConfidence = baseConfidence;
  
  try {
    await learningEngine.initialize();
    const stats = await learningEngine.getAssetStats(ticker.symbol);
    if (stats) {
      learningLevel = stats.learningLevel;
      optimizedConfidence = await learningEngine.getOptimizedConfidence(ticker.symbol, baseConfidence);
    }
  } catch (error) {
    console.error('Error getting learning stats:', error);
  }

  // Detect manipulation zones based on price action and volume
  const manipulationZones = detectManipulationZones(volumeDelta, priceVolatility, priceChange, low, high, supportZones, resistanceZones);
  
  // Detect institutional orders based on volume patterns and price levels
  const institutionalOrders = detectInstitutionalOrders(volumeDelta, priceChange, price, open, low, high);

  // Generate descriptive tags based on detected phenomena
  const tags = generateAnalysisTags(optimizedConfidence, learningLevel, volumeDelta, priceChange, priceVolatility, manipulationZones, institutionalOrders, trend, strength);

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
    optimizedConfidence,
  };
}

function detectManipulationZones(
  volumeDelta: number,
  priceVolatility: number,
  priceChange: number,
  low: number,
  high: number,
  supportZones: number[],
  resistanceZones: number[]
): ManipulationZone[] {
  const zones: ManipulationZone[] = [];
  
  // Detect liquidity zones (areas with high volume and price rejection)
  if (volumeDelta > 5 && priceVolatility > 0.02) {
    zones.push({
      priceRange: { min: low, max: high },
      confidence: Math.min(volumeDelta / 10, 0.9)
    });
  }
  
  // Detect order blocks (strong support/resistance with volume)
  if (Math.abs(priceChange) > 3 && volumeDelta > 3) {
    zones.push({
      priceRange: { min: supportZones[0], max: resistanceZones[0] },
      confidence: Math.min((Math.abs(priceChange) + volumeDelta) / 15, 0.85)
    });
  }

  return zones;
}

function detectInstitutionalOrders(
  volumeDelta: number,
  priceChange: number,
  price: number,
  open: number,
  low: number,
  high: number
): InstitutionalOrder[] {
  const orders: InstitutionalOrder[] = [];
  
  // Large volume with minimal price movement suggests institutional accumulation/distribution
  if (volumeDelta > 8 && Math.abs(priceChange) < 2) {
    orders.push({
      direction: price > open ? 'up' : 'down',
      confidence: Math.min(volumeDelta / 12, 0.95),
      price: (open + price) / 2
    });
  }
  
  // Strong directional move with high volume suggests institutional momentum
  if (Math.abs(priceChange) > 5 && volumeDelta > 6) {
    orders.push({
      direction: priceChange > 0 ? 'up' : 'down',
      confidence: Math.min((Math.abs(priceChange) + volumeDelta) / 18, 0.9),
      price: (low + high) / 2
    });
  }

  return orders;
}

function generateAnalysisTags(
  optimizedConfidence: number,
  learningLevel: number,
  volumeDelta: number,
  priceChange: number,
  priceVolatility: number,
  manipulationZones: ManipulationZone[],
  institutionalOrders: InstitutionalOrder[],
  trend: 'bullish' | 'bearish',
  strength: number
): string[] {
  const tags: string[] = [];
  
  if (optimizedConfidence > 0.7) tags.push('Alta Confiança');
  if (optimizedConfidence < 0.3) tags.push('Baixa Confiança');
  if (learningLevel > 0.7) tags.push('IA Avançada');
  if (learningLevel > 0.4 && learningLevel <= 0.7) tags.push('IA Intermediária');
  if (volumeDelta > 8) tags.push('Volume Institucional');
  if (Math.abs(priceChange) > 5) tags.push('Movimento Forte');
  if (priceVolatility > 0.03) tags.push('Alta Volatilidade');
  if (manipulationZones.length > 0) tags.push('Zona de Manipulação Detectada');
  if (institutionalOrders.length > 0) tags.push('Ordem Institucional Detectada');
  if (trend === 'bullish' && strength > 70) tags.push('Forte Tendência de Alta');
  if (trend === 'bearish' && strength > 70) tags.push('Forte Tendência de Baixa');
  if (volumeDelta > 5 && Math.abs(priceChange) < 1) tags.push('Acumulação/Distribuição');

  return tags;
}
