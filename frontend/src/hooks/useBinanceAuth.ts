import { useState, useCallback } from 'react';
import {
  saveCredentials,
  clearCredentials,
  getCredentials,
  hasCredentials,
  type BinanceCredentials,
} from '../lib/binanceAuth';

export function useBinanceAuth() {
  const [credentials, setCredentials] = useState<BinanceCredentials | null>(
    () => getCredentials()
  );

  const save = useCallback((apiKey: string, secretKey: string) => {
    saveCredentials(apiKey, secretKey);
    setCredentials({ apiKey, secretKey });
  }, []);

  const clear = useCallback(() => {
    clearCredentials();
    setCredentials(null);
  }, []);

  return {
    credentials,
    hasCredentials: hasCredentials(),
    saveCredentials: save,
    clearCredentials: clear,
  };
}
