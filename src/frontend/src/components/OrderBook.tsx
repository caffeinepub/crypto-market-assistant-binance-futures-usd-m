import { BookOpen, RefreshCw, AlertCircle, Server, TrendingUp, TrendingDown } from 'lucide-react';
import TabPageCard from './TabPageCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOrderBookFutures, useOrderBookSpot } from '@/hooks/queries/orderBookDepth';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function OrderBook() {
  const queryClient = useQueryClient();
  const [aggregationLevel, setAggregationLevel] = useState<number>(1);
  
  const futuresQuery = useOrderBookFutures(aggregationLevel);
  const spotQuery = useOrderBookSpot(aggregationLevel);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['orderbook-futures'] });
    queryClient.invalidateQueries({ queryKey: ['orderbook-spot'] });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatSize = (size: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(size);
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
      return { category: 'API Blocked', icon: <AlertCircle className="h-4 w-4" /> };
    }
    
    if (msg.includes('429') || msg.includes('rate limit')) {
      return { category: 'Rate Limit', icon: <AlertCircle className="h-4 w-4" /> };
    }
    
    if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('server')) {
      return { category: 'Server Error', icon: <AlertCircle className="h-4 w-4" /> };
    }
    
    return { category: 'Error', icon: <AlertCircle className="h-4 w-4" /> };
  };

  const renderDepthSection = (
    title: string,
    description: string,
    query: typeof futuresQuery | typeof spotQuery,
    color: string,
    usedBackendFallback?: boolean
  ) => {
    return (
      <Card className={`border-${color}/30 bg-card/40`}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className={`text-xl text-${color}`}>{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {usedBackendFallback && (
                <Badge variant="outline" className="text-xs gap-1 border-neon-cyan/50 text-neon-cyan">
                  <Server className="h-3 w-3" />
                  Backend
                </Badge>
              )}
              {query.dataUpdatedAt && (
                <Badge variant="outline" className="text-xs">
                  Last updated: {formatTimestamp(query.dataUpdatedAt)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {query.isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}

          {query.isError && (
            <Alert variant="destructive">
              {(() => {
                const { category, icon } = getErrorCategory(query.error?.message || '');
                return (
                  <>
                    {icon}
                    <AlertDescription>
                      <div className="font-semibold">{category}</div>
                      <div className="text-sm mt-1">{query.error?.message || 'Unknown error'}</div>
                      {category === 'API Blocked' && (
                        <div className="text-xs mt-2 opacity-80">
                          The browser cannot reach the API. Backend fallback will be attempted automatically for Spot.
                        </div>
                      )}
                    </AlertDescription>
                  </>
                );
              })()}
            </Alert>
          )}

          {query.isSuccess && query.data && (
            <>
              {query.data.isEmpty ? (
                <Alert>
                  <AlertDescription>
                    No depth data returned from the API at this time.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {/* Metrics */}
                  {query.data.metrics ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Mid Price</div>
                        <div className="text-lg font-semibold">{formatPrice(query.data.metrics.midPrice)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Spread</div>
                        <div className="text-lg font-semibold">{formatPrice(query.data.metrics.spread)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Imbalance</div>
                        <div className={`text-lg font-semibold flex items-center gap-1 ${
                          query.data.metrics.imbalance > 0 ? 'text-neon-green' : 'text-neon-red'
                        }`}>
                          {query.data.metrics.imbalance > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {(query.data.metrics.imbalance * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Insufficient data to compute metrics
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Order Book Tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Asks */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-neon-red">Asks (Sell Orders)</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Price</TableHead>
                              <TableHead className="text-xs text-right">Size</TableHead>
                              <TableHead className="text-xs text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {query.data.asks.slice(0, 15).map((level, idx) => (
                              <TableRow
                                key={idx}
                                className={level.isWall ? 'bg-neon-red/10 font-semibold' : ''}
                              >
                                <TableCell className="text-xs text-neon-red">{formatPrice(level.price)}</TableCell>
                                <TableCell className="text-xs text-right">{formatSize(level.size)}</TableCell>
                                <TableCell className="text-xs text-right">{formatSize(level.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Bids */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-neon-green">Bids (Buy Orders)</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Price</TableHead>
                              <TableHead className="text-xs text-right">Size</TableHead>
                              <TableHead className="text-xs text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {query.data.bids.slice(0, 15).map((level, idx) => (
                              <TableRow
                                key={idx}
                                className={level.isWall ? 'bg-neon-green/10 font-semibold' : ''}
                              >
                                <TableCell className="text-xs text-neon-green">{formatPrice(level.price)}</TableCell>
                                <TableCell className="text-xs text-right">{formatSize(level.size)}</TableCell>
                                <TableCell className="text-xs text-right">{formatSize(level.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <TabPageCard
      icon={<BookOpen className="h-8 w-8 text-neon-purple" />}
      title="Order Book"
      description="BTCUSDT depth for Futures (USD-M) and Spot markets"
      badge={
        <div className="flex items-center gap-2">
          <Select value={aggregationLevel.toString()} onValueChange={(v) => setAggregationLevel(parseFloat(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.1">$0.1</SelectItem>
              <SelectItem value="0.5">$0.5</SelectItem>
              <SelectItem value="1">$1</SelectItem>
              <SelectItem value="5">$5</SelectItem>
            </SelectContent>
          </Select>
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
        </div>
      }
    >
      <div className="space-y-6">
        {/* BTC Futures USD-M Section */}
        {renderDepthSection(
          'BTC Futures (USD-M)',
          'Order book depth from Binance Futures',
          futuresQuery,
          'neon-cyan'
        )}

        {/* BTC Spot Section */}
        {renderDepthSection(
          'BTC Spot',
          'Order book depth from Binance Spot',
          spotQuery,
          'neon-purple',
          spotQuery.data?.usedBackendFallback
        )}
      </div>
    </TabPageCard>
  );
}
