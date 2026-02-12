import { useState, useEffect, useCallback } from 'react';
import {
  RadarSensitivityPreset,
  RadarSensitivityPolicy,
  getSensitivityPreset,
  setSensitivityPreset,
  getSensitivityPolicy,
} from '@/lib/radarSensitivity';

/**
 * Hook to manage Radar sensitivity preset with localStorage persistence
 */
export function useRadarSensitivity() {
  const [preset, setPresetState] = useState<RadarSensitivityPreset>(() => getSensitivityPreset());
  const [policy, setPolicyState] = useState<RadarSensitivityPolicy>(() => getSensitivityPolicy(preset));

  const setPreset = useCallback((newPreset: RadarSensitivityPreset) => {
    setSensitivityPreset(newPreset);
    setPresetState(newPreset);
    setPolicyState(getSensitivityPolicy(newPreset));
  }, []);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'radar-sensitivity-preset' && e.newValue) {
        const newPreset = e.newValue as RadarSensitivityPreset;
        if (newPreset === 'conservative' || newPreset === 'balanced' || newPreset === 'aggressive') {
          setPresetState(newPreset);
          setPolicyState(getSensitivityPolicy(newPreset));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    preset,
    policy,
    setPreset,
  };
}
