import { Building2, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Server } from 'lucide-react';
import TabPageCard from './TabPageCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInstitutionalOrdersFutures, useInstitutionalOrdersSpot } from '@/hooks/queries/institutionalOrders';
import { useQueryClient } from '@tanstack/react-query';

export default function InstitutionalOrders() {
  const queryClient = useQueryClient();
  const futuresQuery = useInstitutionalOrdersFutures();
  const spotQuery = useInstitutionalOrdersSpot();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['institutional-orders-futures'] });
    queryClient.invalidateQueries({ queryKey: ['institutional-orders-spot'] });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp));
  };

  // Classify error type for better messaging
  const getErrorCategory = (errorMessage: string): { category: string; icon: React.ReactNode } => {
    const msg = errorMessage.toLowerCase();
    
    if (msg.includes('network') || msg.includes('fetch')) {
      return { category: 'Network Error', icon: <AlertCircle className="h-4 w-4" /> };
    }
    
    if (msg.includes('blocked') || msg.includes('restricted') || msg.includes('cors') || msg.includes('403')) {
      return { category: 'Binance Spot API Blocked', icon: <AlertCircle className="h-4 w-4" /> };
    }
    
    if (msg.includes('429') || msg.includes('rate limit')) {
      return { category: 'Rate Limit', icon: <AlertCircle className="h-4 w-4" /> };
    }
    
    if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('server')) {
      return { category: 'Server Error', icon: <AlertCircle className="h-4 w-4" /> };
    }
    
    return { category: 'Error', icon: <AlertCircle className="h-4 w-4" /> };
  };

  return (
    <TabPageCard
      icon={<Building2 className="h-8 w-8 text-neon-purple" />}
      title="Institutional Orders"
      description="BTC-only institutional buy/sell signals for Futures (USD-M) and Spot markets"
      badge={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={futuresQuery.isFetching || spotQuery.isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${(futuresQuery.isFetching || spotQuery.isFetching) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* BTC Futures USD-M Section */}
        <Card className="border-neon-cyan/30 bg-card/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-neon-cyan">BTC Futures (USD-M)</CardTitle>
                <CardDescription className="mt-1">
                  Institutional signals from Binance Futures
                </CardDescription>
              </div>
              {futuresQuery.dataUpdatedAt && (
                <Badge variant="outline" className="text-xs">
                  Last updated: {formatTimestamp(futuresQuery.dataUpdatedAt)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {futuresQuery.isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}

            {futuresQuery.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">Failed to load Futures data</div>
                  <div className="text-sm mt-1">{futuresQuery.error?.message || 'Unknown error'}</div>
                </AlertDescription>
              </Alert>
            )}

            {futuresQuery.isSuccess && futuresQuery.data && (
              <>
                {futuresQuery.data.signals.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No institutional signals detected for BTC Futures at this time.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {futuresQuery.data.signals.map((signal, idx) => (
                      <Card
                        key={idx}
                        className={`border-2 ${
                          signal.direction === 'up'
                            ? 'border-neon-green/40 bg-neon-green/5'
                            : 'border-neon-red/40 bg-neon-red/5'
                        }`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {signal.direction === 'up' ? (
                                <TrendingUp className="h-6 w-6 text-neon-green" />
                              ) : (
                                <TrendingDown className="h-6 w-6 text-neon-red" />
                              )}
                              <div>
                                <div className="font-semibold text-lg">
                                  {signal.direction === 'up' ? 'BUY' : 'SELL'} Signal
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Price Level: {formatPrice(signal.price)}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-sm ${
                                signal.direction === 'up'
                                  ? 'border-neon-green text-neon-green'
                                  : 'border-neon-red text-neon-red'
                              }`}
                            >
                              {(signal.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* BTC Spot Section */}
        <Card className="border-neon-purple/30 bg-card/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-neon-purple">BTC Spot</CardTitle>
                <CardDescription className="mt-1">
                  Institutional signals from Binance Spot
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {spotQuery.data?.usedBackendFallback && (
                  <Badge variant="outline" className="text-xs gap-1 border-neon-cyan/50 text-neon-cyan">
                    <Server className="h-3 w-3" />
                    Backend
                  </Badge>
                )}
                {spotQuery.dataUpdatedAt && (
                  <Badge variant="outline" className="text-xs">
                    Last updated: {formatTimestamp(spotQuery.dataUpdatedAt)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {spotQuery.isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}

            {spotQuery.isError && (
              <Alert variant="destructive">
                {(() => {
                  const { category, icon } = getErrorCategory(spotQuery.error?.message || '');
                  return (
                    <>
                      {icon}
                      <AlertDescription>
                        <div className="font-semibold">{category}</div>
                        <div className="text-sm mt-1">{spotQuery.error?.message || 'Unknown error'}</div>
                        {category === 'Binance Spot API Blocked' && (
                          <div className="text-xs mt-2 opacity-80">
                            The browser cannot reach Binance Spot API. Backend fallback will be attempted automatically.
                          </div>
                        )}
                      </AlertDescription>
                    </>
                  );
                })()}
              </Alert>
            )}

            {spotQuery.isSuccess && spotQuery.data && (
              <>
                {spotQuery.data.signals.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No institutional signals detected for BTC Spot at this time.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {spotQuery.data.signals.map((signal, idx) => (
                      <Card
                        key={idx}
                        className={`border-2 ${
                          signal.direction === 'up'
                            ? 'border-neon-green/40 bg-neon-green/5'
                            : 'border-neon-red/40 bg-neon-red/5'
                        }`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {signal.direction === 'up' ? (
                                <TrendingUp className="h-6 w-6 text-neon-green" />
                              ) : (
                                <TrendingDown className="h-6 w-6 text-neon-red" />
                              )}
                              <div>
                                <div className="font-semibold text-lg">
                                  {signal.direction === 'up' ? 'BUY' : 'SELL'} Signal
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Price Level: {formatPrice(signal.price)}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-sm ${
                                signal.direction === 'up'
                                  ? 'border-neon-green text-neon-green'
                                  : 'border-neon-red text-neon-red'
                              }`}
                            >
                              {(signal.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TabPageCard>
  );
}
