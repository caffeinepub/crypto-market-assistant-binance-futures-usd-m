/**
 * Radar sensitivity presets and persistence utilities
 */

export type RadarSensitivityPreset = 'conservative' | 'balanced' | 'aggressive';

export interface RadarSensitivityPolicy {
  // Detection thresholds
  priceChangeThreshold: number; // Base price change % to trigger
  volumeRatioThreshold: number; // Base volume ratio to trigger
  volatilityThreshold: number; // Base volatility % to trigger
  
  // Corroboration rules
  requireCorroboration: boolean; // Whether smaller moves need corroboration
  corroborationMultiplier: number; // How much to relax thresholds when corroborated
  
  // Confidence and scoring
  minConfidenceForAlert: number; // Minimum confidence to show alert
  minConfidenceForNotification: number; // Minimum confidence to notify
  
  // Notification behavior
  notificationCooldownMs: number; // Cooldown between notifications for same symbol
}

const SENSITIVITY_POLICIES: Record<RadarSensitivityPreset, RadarSensitivityPolicy> = {
  conservative: {
    priceChangeThreshold: 4.0,
    volumeRatioThreshold: 2.0,
    volatilityThreshold: 10.0,
    requireCorroboration: true,
    corroborationMultiplier: 0.6,
    minConfidenceForAlert: 0.5,
    minConfidenceForNotification: 0.7,
    notificationCooldownMs: 300000, // 5 minutes
  },
  balanced: {
    priceChangeThreshold: 3.0,
    volumeRatioThreshold: 1.5,
    volatilityThreshold: 8.0,
    requireCorroboration: true,
    corroborationMultiplier: 0.7,
    minConfidenceForAlert: 0.3,
    minConfidenceForNotification: 0.6,
    notificationCooldownMs: 180000, // 3 minutes
  },
  aggressive: {
    priceChangeThreshold: 2.0,
    volumeRatioThreshold: 1.3,
    volatilityThreshold: 6.0,
    requireCorroboration: false,
    corroborationMultiplier: 0.8,
    minConfidenceForAlert: 0.2,
    minConfidenceForNotification: 0.5,
    notificationCooldownMs: 120000, // 2 minutes
  },
};

const STORAGE_KEY = 'radar-sensitivity-preset';
const DEFAULT_PRESET: RadarSensitivityPreset = 'balanced';

/**
 * Get the current sensitivity preset from localStorage
 */
export function getSensitivityPreset(): RadarSensitivityPreset {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'conservative' || stored === 'balanced' || stored === 'aggressive')) {
      return stored as RadarSensitivityPreset;
    }
  } catch (error) {
    console.warn('Error reading sensitivity preset:', error);
  }
  return DEFAULT_PRESET;
}

/**
 * Save the sensitivity preset to localStorage
 */
export function setSensitivityPreset(preset: RadarSensitivityPreset): void {
  try {
    localStorage.setItem(STORAGE_KEY, preset);
  } catch (error) {
    console.warn('Error saving sensitivity preset:', error);
  }
}

/**
 * Get the policy for a given preset
 */
export function getSensitivityPolicy(preset: RadarSensitivityPreset): RadarSensitivityPolicy {
  return SENSITIVITY_POLICIES[preset];
}

/**
 * Get the current active policy
 */
export function getCurrentPolicy(): RadarSensitivityPolicy {
  const preset = getSensitivityPreset();
  return getSensitivityPolicy(preset);
}
