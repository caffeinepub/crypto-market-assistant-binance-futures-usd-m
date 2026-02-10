import { BinanceMarketData, Recommendation, RadarAlert, DirectionType } from '../useQueries';
import { fetchFundingRates, fetchOpenInterest, metricsHistory, FundingRateData, OpenInterestData } from './binanceFuturesMetrics';

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
 * Detect extreme volatility using intraday range
 */
function detectExtremeVolatility(market: BinanceMarketData): { detected: boolean; score: number; reason: string } {
  const high = parseFloat(market.highPrice);
  const low = parseFloat(market.lowPrice);
  const open = parseFloat(market.openPrice);
  const last = parseFloat(market.lastPrice);
  
  // Calculate intraday range as percentage of open
  const range = ((high - low) / open) * 100;
  
  // Extreme volatility threshold: >8% intraday range
  const isExtreme = range > 8;
  
  // Calculate volatility score
  const volatilityScore = Math.min(range / 15, 1.0);
  
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
 * Generate radar alerts from market data with multiple anomaly types
 */
export async function generateRadarAlerts(marketData: BinanceMarketData[]): Promise<ExtendedRadarAlert[]> {
  const alerts: ExtendedRadarAlert[] = [];
  const avgVolume = 5000000000; // Baseline average volume
  
  // Fetch funding and open interest data for all symbols
  const symbols = marketData.map(m => m.symbol);
  const [fundingData, openInterestData] = await Promise.all([
    fetchFundingRates(symbols),
    fetchOpenInterest(symbols),
  ]);
  
  marketData.forEach((market) => {
    const percentChange = market.priceChangePercent;
    const volume = parseFloat(market.quoteVolume);
    const volumeRatio = volume / avgVolume;
    
    const anomalyTypes: AnomalyType[] = [];
    const reasons: string[] = [];
    let totalScore = 0;
    let anomalyCount = 0;
    
    // 1. Detect price anomalies (>3% change)
    const isPriceAnomaly = Math.abs(percentChange) > 3;
    if (isPriceAnomaly) {
      anomalyTypes.push('price_move');
      reasons.push(`Price ${percentChange > 0 ? 'surge' : 'drop'}: ${Math.abs(percentChange).toFixed(2)}%`);
      totalScore += Math.abs(percentChange) / 10;
      anomalyCount++;
    }
    
    // 2. Detect volume anomalies (>150% of average)
    const isVolumeAnomaly = volumeRatio > 1.5;
    if (isVolumeAnomaly) {
      anomalyTypes.push('volume_spike');
      reasons.push(`Volume spike: ${(volumeRatio * 100).toFixed(0)}% of baseline`);
      totalScore += (volumeRatio - 1) / 2;
      anomalyCount++;
    }
    
    // 3. Detect extreme volatility
    const volatility = detectExtremeVolatility(market);
    if (volatility.detected) {
      anomalyTypes.push('extreme_volatility');
      reasons.push(volatility.reason);
      totalScore += volatility.score;
      anomalyCount++;
    }
    
    // 4. Detect funding irregularities
    const currentFunding = fundingData.get(market.symbol);
    const priorFunding = metricsHistory.getPriorFunding(market.symbol);
    const funding = detectFundingIrregularity(market.symbol, currentFunding, priorFunding);
    if (funding.detected) {
      anomalyTypes.push('funding_irregularity');
      reasons.push(funding.reason);
      totalScore += funding.score;
      anomalyCount++;
    }
    
    // 5. Detect open interest spikes
    const currentOI = openInterestData.get(market.symbol);
    const priorOI = metricsHistory.getPriorOpenInterest(market.symbol);
    const openInterest = detectOpenInterestSpike(market.symbol, currentOI, priorOI);
    if (openInterest.detected) {
      anomalyTypes.push('open_interest_spike');
      reasons.push(openInterest.reason);
      totalScore += openInterest.score;
      anomalyCount++;
    }
    
    // Create alert if any anomaly is detected
    if (anomalyTypes.length > 0) {
      const anomalyScore = anomalyCount > 0 ? totalScore / anomalyCount : 0;
      const confidence = Math.min(anomalyScore, 1.0);
      
      alerts.push({
        symbol: market.symbol,
        percentChange,
        volumeDelta: volumeRatio,
        direction: percentChange >= 0 ? 'up' : 'down',
        confidence,
        anomalyScore: totalScore,
        anomalyTypes,
        reasons,
        timestamp: Date.now(),
      });
    }
  });
  
  // Update history for next comparison
  metricsHistory.updateFunding(fundingData);
  metricsHistory.updateOpenInterest(openInterestData);
  
  // Sort by anomaly score (highest first)
  return alerts.sort((a, b) => b.anomalyScore - a.anomalyScore);
}
