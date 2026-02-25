import { useEffect, useRef } from 'react';
import { startEngine, stopEngine, isEngineRunning } from '../lib/aiPaperTradingEngine';

// Singleton guard - only one engine instance across all hook usages
let engineStarted = false;

export function useAIPaperTradingEngine() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (engineStarted || startedRef.current) return;
    engineStarted = true;
    startedRef.current = true;
    startEngine();

    return () => {
      // Don't stop on unmount - engine should keep running
    };
  }, []);

  return {
    isRunning: isEngineRunning(),
    start: startEngine,
    stop: stopEngine,
  };
}
