/**
 * Radar filter persistence and defaults
 */

import { AnomalyType } from '@/hooks/queries/localSignals';

export interface RadarFilters {
  enabledAnomalyTypes: Set<AnomalyType>;
  minAnomalyScore: number;
  minConfidence: number;
}

const STORAGE_KEY_ANOMALY_TYPES = 'radar-filter-anomaly-types';
const STORAGE_KEY_MIN_SCORE = 'radar-filter-min-score';
const STORAGE_KEY_MIN_CONFIDENCE = 'radar-filter-min-confidence';

const ALL_ANOMALY_TYPES: AnomalyType[] = [
  'price_move',
  'volume_spike',
  'extreme_volatility',
  'funding_irregularity',
  'open_interest_spike',
];

/**
 * Get default filters (all types enabled, no minimums)
 */
export function getDefaultFilters(): RadarFilters {
  return {
    enabledAnomalyTypes: new Set(ALL_ANOMALY_TYPES),
    minAnomalyScore: 0,
    minConfidence: 0,
  };
}

/**
 * Load filters from localStorage
 */
export function loadFilters(): RadarFilters {
  try {
    const storedTypes = localStorage.getItem(STORAGE_KEY_ANOMALY_TYPES);
    const storedScore = localStorage.getItem(STORAGE_KEY_MIN_SCORE);
    const storedConfidence = localStorage.getItem(STORAGE_KEY_MIN_CONFIDENCE);

    const enabledAnomalyTypes = storedTypes
      ? new Set(JSON.parse(storedTypes) as AnomalyType[])
      : new Set(ALL_ANOMALY_TYPES);

    const minAnomalyScore = storedScore ? parseFloat(storedScore) : 0;
    const minConfidence = storedConfidence ? parseFloat(storedConfidence) : 0;

    return {
      enabledAnomalyTypes,
      minAnomalyScore: isNaN(minAnomalyScore) ? 0 : minAnomalyScore,
      minConfidence: isNaN(minConfidence) ? 0 : minConfidence,
    };
  } catch (error) {
    console.warn('Error loading radar filters:', error);
    return getDefaultFilters();
  }
}

/**
 * Save filters to localStorage
 */
export function saveFilters(filters: RadarFilters): void {
  try {
    localStorage.setItem(
      STORAGE_KEY_ANOMALY_TYPES,
      JSON.stringify(Array.from(filters.enabledAnomalyTypes))
    );
    localStorage.setItem(STORAGE_KEY_MIN_SCORE, filters.minAnomalyScore.toString());
    localStorage.setItem(STORAGE_KEY_MIN_CONFIDENCE, filters.minConfidence.toString());
  } catch (error) {
    console.warn('Error saving radar filters:', error);
  }
}

/**
 * Reset filters to defaults and clear localStorage
 */
export function resetFilters(): RadarFilters {
  try {
    localStorage.removeItem(STORAGE_KEY_ANOMALY_TYPES);
    localStorage.removeItem(STORAGE_KEY_MIN_SCORE);
    localStorage.removeItem(STORAGE_KEY_MIN_CONFIDENCE);
  } catch (error) {
    console.warn('Error resetting radar filters:', error);
  }
  return getDefaultFilters();
}

/**
 * Get all available anomaly types
 */
export function getAllAnomalyTypes(): AnomalyType[] {
  return [...ALL_ANOMALY_TYPES];
}
