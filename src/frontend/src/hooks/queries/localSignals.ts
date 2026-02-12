import { BinanceMarketData, Recommendation, RadarAlert, DirectionType } from '../useQueries';
import { fetchFundingRates, fetchOpenInterest, metricsHistory, FundingRateData, OpenInterestData } from './binanceFuturesMetrics';
import { RadarSensitivityPolicy } from '@/lib/radarSensitivity';

/**
 * Anomaly types for Radar alerts
 */
export type AnomalyType = 
  | 'price_move'
  | 'volume_spike'
  | 'extreme_volatility'
  | 'funding_irregularity'
  | 'open_interest_spike';

/**
 * Extended RadarAlert with anomaly types and reasons
 */
export interface ExtendedRadarAlert {
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

/**
 * Generate recommendations from market data based on bullish trends with high confidence
 */
export function generateRecommendations(marketData: BinanceMarketData[]): Recommendation[] {
  const topBullish = marketData
    .filter((m) => m.analysis.trend === 'bullish' && m.analysis.strength > 50 && m.analysis.confidence > 0.4)
    .sort((a, b) => {
      // Prioritize by learning level, then confidence, then strength
      const learningDiff = (b.analysis.learningLevel || 0) - (a.analysis.learningLevel || 0);
      if (Math.abs(learningDiff) > 0.1) return learningDiff;
      
      const confDiff = b.analysis.confidence - a.analysis.confidence;
      if (Math.abs(confDiff) > 0.1) return confDiff;
      
      return b.analysis.strength - a.analysis.strength;
    })
    .slice(0, 15)
    .map((market) => ({
      symbol: market.symbol,
      strength: market.analysis.strength,
      confidence: market.analysis.confidence,
      timestamp: Date.now(),
    }));

  return topBullish;
}

/**
 * Compute adaptive baseline from market data (percentile-based)
 */
function computeAdaptiveBaselines(marketData: BinanceMarketData[]) {
  const volumes = marketData.map(m => parseFloat(m.quoteVolume)).filter(v => v > 0).sort((a, b) => a - b);
  const priceChanges = marketData.map(m => Math.abs(m.priceChangePercent)).sort((a, b) => a - b);
  
  // Use median as baseline
  const medianVolume = volumes.length > 0 ? volumes[Math.floor(volumes.length / 2)] : 5000000000;
  const medianPriceChange = priceChanges.length > 0 ? priceChanges[Math.floor(priceChanges.length / 2)] : 1.5;
  
  // Use 75th percentile for high activity baseline
  const p75Volume = volumes.length > 0 ? volumes[Math.floor(volumes.length * 0.75)] : medianVolume * 2;
  
  return {
    medianVolume,
    medianPriceChange,
    p75Volume,
  };
}

/**
 * Detect extreme volatility using intraday range
 */
function detectExtremeVolatility(
  market: BinanceMarketData,
  policy: RadarSensitivityPolicy
): { detected: boolean; score: number; reason: string } {
  const high = parseFloat(market.highPrice);
  const low = parseFloat(market.lowPrice);
  const open = parseFloat(market.openPrice);
  
  if (open === 0) {
    return { detected: false, score: 0, reason: '' };
  }
  
  // Calculate intraday range as percentage of open
  const range = ((high - low) / open) * 100;
  
  // Use policy threshold
  const isExtreme = range > policy.volatilityThreshold;
  
  // Calculate volatility score (normalized)
  const volatilityScore = Math.min(range / (policy.volatilityThreshold * 2), 1.0);
  
  const reason = isExtreme 
    ? `Extreme volatility: ${range.toFixed(2)}% intraday range`
    : '';
  
  return {
    detected: isExtreme,
    score: volatilityScore,
    reason,
  };
}

/**
 * Detect funding irregularities
 */
function detectFundingIrregularity(
  symbol: string,
  currentFunding: FundingRateData | undefined,
  priorFunding: FundingRateData | undefined
): { detected: boolean; score: number; reason: string } {
  if (!currentFunding) {
    return { detected: false, score: 0, reason: '' };
  }
  
  const currentRate = currentFunding.fundingRate * 100; // Convert to percentage
  
  // Check for extreme absolute funding rate (>0.1% or <-0.1%)
  const isExtremeAbsolute = Math.abs(currentRate) > 0.1;
  
  // Check for abrupt change if we have prior data
  let isAbruptChange = false;
  let changeMagnitude = 0;
  
  if (priorFunding) {
    const priorRate = priorFunding.fundingRate * 100;
    const change = Math.abs(currentRate - priorRate);
    changeMagnitude = change;
    
    // Abrupt change threshold: >0.05% change
    isAbruptChange = change > 0.05;
  }
  
  const detected = isExtremeAbsolute || isAbruptChange;
  
  let reason = '';
  if (isExtremeAbsolute) {
    reason = `Extreme funding rate: ${currentRate.toFixed(4)}%`;
  } else if (isAbruptChange) {
    reason = `Funding rate spike: ${changeMagnitude.toFixed(4)}% change`;
  }
  
  // Score based on magnitude
  const score = Math.min(Math.abs(currentRate) / 0.2 + changeMagnitude / 0.1, 1.0);
  
  return { detected, score, reason };
}

/**
 * Detect open interest spikes
 */
function detectOpenInterestSpike(
  symbol: string,
  currentOI: OpenInterestData | undefined,
  priorOI: OpenInterestData | undefined
): { detected: boolean; score: number; reason: string } {
  if (!currentOI || !priorOI) {
    return { detected: false, score: 0, reason: '' };
  }
  
  const current = currentOI.openInterest;
  const prior = priorOI.openInterest;
  
  if (prior === 0) {
    return { detected: false, score: 0, reason: '' };
  }
  
  const changePercent = ((current - prior) / prior) * 100;
  
  // Spike threshold: >15% change in open interest
  const isSpike = Math.abs(changePercent) > 15;
  
  const score = Math.min(Math.abs(changePercent) / 30, 1.0);
  
  const reason = isSpike
    ? `Open interest ${changePercent > 0 ? 'surge' : 'drop'}: ${Math.abs(changePercent).toFixed(1)}%`
    : '';
  
  return { detected: isSpike, score, reason };
}

/**
 * Generate radar alerts from market data with adaptive baselines and sensitivity policy
 */
export async function generateRadarAlerts(
  marketData: BinanceMarketData[],
  policy: RadarSensitivityPolicy
): Promise<ExtendedRadarAlert[]> {
  const alerts: ExtendedRadarAlert[] = [];
  
  // Compute adaptive baselines from current market data
  const baselines = computeAdaptiveBaselines(marketData);
  
  // Fetch funding and open interest data for all symbols
  const symbols = marketData.map(m => m.symbol);
  const [fundingData, openInterestData] = await Promise.all([
    fetchFundingRates(symbols),
    fetchOpenInterest(symbols),
  ]);
  
  marketData.forEach((market) => {
    const percentChange = market.priceChangePercent;
    const volume = parseFloat(market.quoteVolume);
    const volumeRatio = volume / baselines.medianVolume;
    
    const anomalyTypes: AnomalyType[] = [];
    const reasons: string[] = [];
    let totalScore = 0;
    let anomalyCount = 0;
    
    // Detect all anomaly types first
    const detections = {
      price: false,
      volume: false,
      volatility: false,
      funding: false,
      openInterest: false,
    };
    
    // 1. Detect price anomalies (adaptive threshold)
    const priceThreshold = policy.priceChangeThreshold;
    const isPriceAnomaly = Math.abs(percentChange) > priceThreshold;
    if (isPriceAnomaly) {
      detections.price = true;
    }
    
    // 2. Detect volume anomalies (adaptive threshold)
    const isVolumeAnomaly = volumeRatio > policy.volumeRatioThreshold;
    if (isVolumeAnomaly) {
      detections.volume = true;
    }
    
    // 3. Detect extreme volatility
    const volatility = detectExtremeVolatility(market, policy);
    if (volatility.detected) {
      detections.volatility = true;
    }
    
    // 4. Detect funding irregularities
    const currentFunding = fundingData.get(market.symbol);
    const priorFunding = metricsHistory.getPriorFunding(market.symbol);
    const funding = detectFundingIrregularity(market.symbol, currentFunding, priorFunding);
    if (funding.detected) {
      detections.funding = true;
    }
    
    // 5. Detect open interest spikes
    const currentOI = openInterestData.get(market.symbol);
    const priorOI = metricsHistory.getPriorOpenInterest(market.symbol);
    const openInterest = detectOpenInterestSpike(market.symbol, currentOI, priorOI);
    if (openInterest.detected) {
      detections.openInterest = true;
    }
    
    // Count corroborating signals
    const corroboratingSignals = [
      detections.volume,
      detections.volatility,
      detections.funding,
      detections.openInterest,
    ].filter(Boolean).length;
    
    // Apply corroboration-based earlier detection
    // If we have corroboration, relax price/volatility thresholds
    const hasCorroboration = corroboratingSignals > 0;
    
    if (hasCorroboration && policy.requireCorroboration) {
      // Relax price threshold when corroborated
      const relaxedPriceThreshold = priceThreshold * policy.corroborationMultiplier;
      if (!detections.price && Math.abs(percentChange) > relaxedPriceThreshold) {
        detections.price = true;
      }
      
      // Relax volatility threshold when corroborated
      const relaxedVolatilityThreshold = policy.volatilityThreshold * policy.corroborationMultiplier;
      const high = parseFloat(market.highPrice);
      const low = parseFloat(market.lowPrice);
      const open = parseFloat(market.openPrice);
      if (open > 0) {
        const range = ((high - low) / open) * 100;
        if (!detections.volatility && range > relaxedVolatilityThreshold) {
          detections.volatility = true;
        }
      }
    }
    
    // Now build alert based on detected anomalies
    if (detections.price) {
      anomalyTypes.push('price_move');
      reasons.push(`Price ${percentChange > 0 ? 'surge' : 'drop'}: ${Math.abs(percentChange).toFixed(2)}%`);
      totalScore += Math.abs(percentChange) / 10;
      anomalyCount++;
    }
    
    if (detections.volume) {
      anomalyTypes.push('volume_spike');
      reasons.push(`Volume spike: ${(volumeRatio * 100).toFixed(0)}% of baseline`);
      totalScore += (volumeRatio - 1) / 2;
      anomalyCount++;
    }
    
    if (detections.volatility && volatility.detected) {
      anomalyTypes.push('extreme_volatility');
      reasons.push(volatility.reason);
      totalScore += volatility.score;
      anomalyCount++;
    }
    
    if (detections.funding && funding.detected) {
      anomalyTypes.push('funding_irregularity');
      reasons.push(funding.reason);
      totalScore += funding.score;
      anomalyCount++;
    }
    
    if (detections.openInterest && openInterest.detected) {
      anomalyTypes.push('open_interest_spike');
      reasons.push(openInterest.reason);
      totalScore += openInterest.score;
      anomalyCount++;
    }
    
    // Create alert if any anomaly is detected
    if (anomalyTypes.length > 0) {
      // Compute anomaly score (average of individual scores)
      const anomalyScore = anomalyCount > 0 ? totalScore / anomalyCount : 0;
      
      // Confidence is normalized 0..1 and monotonic with severity
      // Boost confidence when multiple anomalies corroborate
      const baseConfidence = Math.min(anomalyScore, 1.0);
      const corroborationBoost = Math.min(anomalyCount * 0.1, 0.3);
      const confidence = Math.min(baseConfidence + corroborationBoost, 1.0);
      
      // Only include alerts that meet minimum confidence
      if (confidence >= policy.minConfidenceForAlert) {
        alerts.push({
          symbol: market.symbol,
          percentChange,
          volumeDelta: volumeRatio,
          direction: percentChange >= 0 ? 'up' : 'down',
          confidence,
          anomalyScore: totalScore, // Use total score for sorting
          anomalyTypes,
          reasons,
          timestamp: Date.now(),
        });
      }
    }
  });
  
  // Update history for next comparison
  metricsHistory.updateFunding(fundingData);
  metricsHistory.updateOpenInterest(openInterestData);
  
  // Sort by anomaly score (highest first)
  return alerts.sort((a, b) => b.anomalyScore - a.anomalyScore);
}
