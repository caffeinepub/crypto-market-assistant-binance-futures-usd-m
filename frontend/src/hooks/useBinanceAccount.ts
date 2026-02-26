import { useQuery } from '@tanstack/react-query';
import { fetchAccountBalance, type AccountBalance } from './queries/binancePrivateAPI';
import { useBinanceAuth } from './useBinanceAuth';

export function useBinanceAccount() {
  const { credentials } = useBinanceAuth();

  return useQuery<AccountBalance>({
    queryKey: ['binanceAccount', credentials?.apiKey],
    queryFn: async () => {
      if (!credentials) throw new Error('No credentials');
      return fetchAccountBalance(credentials.apiKey, credentials.secretKey);
    },
    enabled: !!credentials,
    refetchInterval: 30_000,
    retry: 1,
  });
}
