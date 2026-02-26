import { useQuery } from '@tanstack/react-query';
import { fetchOpenPositions } from './queries/binancePrivateAPI';
import { useBinanceAuth } from './useBinanceAuth';
import type { PositionData } from '../lib/positionAlerts';

export function useBinancePositions() {
  const { credentials } = useBinanceAuth();

  const query = useQuery<PositionData[]>({
    queryKey: ['binancePositions', credentials?.apiKey],
    queryFn: async () => {
      if (!credentials) throw new Error('No credentials');
      return fetchOpenPositions(credentials.apiKey, credentials.secretKey);
    },
    enabled: !!credentials,
    refetchInterval: 8_000,
    retry: (failureCount, error) => {
      const err = error as { httpStatus?: number };
      if (err?.httpStatus === 401 || err?.httpStatus === 403) return false;
      return failureCount < 2;
    },
  });

  return {
    ...query,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
}
