import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity, AlertCircle, Target, Brain } from 'lucide-react';
import { useBinanceMarketData } from '@/hooks/useQueries';
import MarketCard from './MarketCard';
import PredictiveConfidencePanel from './PredictiveConfidencePanel';
import AIPerformancePanel from './AIPerformancePanel';
import TabFetchErrorState from './TabFetchErrorState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function MarketOverview() {
  const { data: marketData, isLoading, error } = useBinanceMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');

  useEffect(() => {
    if (marketData && marketData.length > 0 && !selectedSymbol) {
      setSelectedSymbol(marketData[0].symbol);
    }
  }, [marketData, selectedSymbol]);

  if (error) {
    return <TabFetchErrorState error={error} title="Market Data Unavailable" description="Unable to fetch live market data from Binance. Check your internet connection and try again." />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!marketData || marketData.length === 0) {
    return (
      <TabFetchErrorState
        title="No Market Data"
        description="No market data is currently available from Binance. Please check your internet connection and try again."
      />
    );
  }

  const selectedMarket = marketData?.find((m) => m.symbol === selectedSymbol);
  const isPositive = selectedMarket ? selectedMarket.priceChangePercent >= 0 : false;
  const hasManipulationZones = selectedMarket && selectedMarket.analysis.manipulationZones.length > 0;
  const hasInstitutionalOrders = selectedMarket && selectedMarket.analysis.institutionalOrders.length > 0;
  const hasLearning = selectedMarket && (selectedMarket.analysis.learningLevel || 0) > 0;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-neon-cyan/30 bg-card/60 backdrop-blur-sm shadow-neon-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-neon-cyan animate-pulse-neon" />
            <CardTitle className="text-2xl text-neon-cyan neon-text">Market Overview</CardTitle>
          </div>
          <CardDescription className="text-base">
            Live data from Binance Futures USD-M with advanced predictive analysis and continuous learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData?.map((market) => (
                <MarketCard
                  key={market.symbol}
                  market={market}
                  isSelected={market.symbol === selectedSymbol}
                  onClick={() => setSelectedSymbol(market.symbol)}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedMarket && (
        <>
          <Card className={cn(
            "border-2 bg-card/60 backdrop-blur-sm transition-all duration-300",
            isPositive 
              ? "border-neon-green/40 shadow-neon-bullish" 
              : "border-neon-red/40 shadow-neon-bearish"
          )}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={cn(
                    "text-3xl font-bold",
                    isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                  )}>
                    {selectedMarket.symbol}
                  </CardTitle>
                  <CardDescription className="text-base">Detailed Analysis with Predictive Intelligence</CardDescription>
                </div>
                <Badge
                  variant={isPositive ? 'default' : 'destructive'}
                  className={cn(
                    "text-xl px-6 py-3 border-2 font-bold",
                    isPositive 
                      ? "bg-neon-green/20 text-neon-green border-neon-green/60 shadow-neon-bullish" 
                      : "bg-neon-red/20 text-neon-red border-neon-red/60 shadow-neon-bearish"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-6 h-6 mr-2" />
                  ) : (
                    <TrendingDown className="w-6 h-6 mr-2" />
                  )}
                  {selectedMarket.priceChangePercent.toFixed(2)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2 p-4 rounded-lg bg-accent/30 border-2 border-neon-cyan/30">
                  <p className="text-sm text-muted-foreground font-medium">Current Price</p>
                  <p className="text-3xl font-bold text-neon-cyan neon-text">
                    ${parseFloat(selectedMarket.lastPrice).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-accent/30 border-2 border-neon-blue/30">
                  <p className="text-sm text-muted-foreground font-medium">24h Volume</p>
                  <p className="text-2xl font-bold text-neon-blue">
                    ${parseFloat(selectedMarket.quoteVolume).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-accent/30 border-2 border-neon-green/30">
                  <p className="text-sm text-muted-foreground font-medium">24h High</p>
                  <p className="text-2xl font-bold text-neon-green">
                    ${parseFloat(selectedMarket.highPrice).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-accent/30 border-2 border-neon-purple/30">
                  <p className="text-sm text-muted-foreground font-medium">24h Low</p>
                  <p className="text-2xl font-bold text-neon-purple">
                    ${parseFloat(selectedMarket.lowPrice).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <PredictiveConfidencePanel analysis={selectedMarket.analysis} symbol={selectedMarket.symbol} />
              </div>

              {hasLearning && (
                <div className="mt-8">
                  <AIPerformancePanel symbol={selectedMarket.symbol} compact />
                </div>
              )}

              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-neon-cyan">Advanced Technical Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300",
                    selectedMarket.analysis.trend === 'bullish'
                      ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish"
                      : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground font-medium">Trend</span>
                      {selectedMarket.analysis.trend === 'bullish' ? (
                        <Badge className="bg-neon-green/20 text-neon-green border-2 border-neon-green/60 font-bold">
                          <TrendingUp className="w-5 h-5 mr-1" />
                          Bullish
                        </Badge>
                      ) : (
                        <Badge className="bg-neon-red/20 text-neon-red border-2 border-neon-red/60 font-bold">
                          <TrendingDown className="w-5 h-5 mr-1" />
                          Bearish
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on SMC analysis, volume delta, momentum and price structure
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/30 border-2 border-neon-cyan/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground font-medium">Signal Strength</span>
                      <Badge variant="outline" className="border-2 border-neon-cyan/60 text-neon-cyan font-bold">
                        {selectedMarket.analysis.strength.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 mt-2 border-2 border-border">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isPositive 
                            ? "bg-gradient-to-r from-neon-green via-neon-cyan to-neon-blue shadow-neon-bullish" 
                            : "bg-gradient-to-r from-neon-red via-neon-orange to-neon-pink shadow-neon-bearish"
                        )}
                        style={{ width: `${selectedMarket.analysis.strength}%` }}
                      />
                    </div>
                  </div>
                </div>

                {(hasManipulationZones || hasInstitutionalOrders) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {hasManipulationZones && (
                      <Card className="border-2 border-neon-orange/40 bg-neon-orange/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <img 
                              src="/assets/generated/manipulation-zone-icon-transparent.dim_48x48.png" 
                              alt="Manipulation Zone" 
                              className="w-6 h-6"
                            />
                            <h4 className="text-sm font-bold text-neon-orange">Manipulation Zones Detected</h4>
                          </div>
                          <div className="space-y-2">
                            {selectedMarket.analysis.manipulationZones.map((zone, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-card/50 border border-neon-orange/30">
                                <span className="text-muted-foreground font-semibold">
                                  ${zone.priceRange.min.toFixed(2)} - ${zone.priceRange.max.toFixed(2)}
                                </span>
                                <Badge className="bg-neon-orange/20 text-neon-orange border border-neon-orange/60 text-xs">
                                  {Math.round(zone.confidence * 100)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {hasInstitutionalOrders && (
                      <Card className="border-2 border-neon-purple/40 bg-neon-purple/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <img 
                              src="/assets/generated/institutional-order-icon-transparent.dim_48x48.png" 
                              alt="Institutional Order" 
                              className="w-6 h-6"
                            />
                            <h4 className="text-sm font-bold text-neon-purple">Institutional Orders Detected</h4>
                          </div>
                          <div className="space-y-2">
                            {selectedMarket.analysis.institutionalOrders.map((order, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-card/50 border border-neon-purple/30">
                                <span className="text-muted-foreground font-semibold">
                                  {order.direction === 'up' ? 'Buy' : 'Sell'} @ ${order.price.toFixed(2)}
                                </span>
                                <Badge className="bg-neon-purple/20 text-neon-purple border border-neon-purple/60 text-xs">
                                  {Math.round(order.confidence * 100)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg bg-neon-green/10 border-2 border-neon-green/40 shadow-neon-bullish">
                    <h4 className="text-sm font-bold text-neon-green mb-3 flex items-center gap-2 neon-text-bullish">
                      <TrendingUp className="w-5 h-5" />
                      Resistance Zones
                    </h4>
                    <div className="space-y-2">
                      {selectedMarket.analysis.resistanceZones.map((zone, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-card/50 border border-neon-green/30">
                          <span className="text-muted-foreground font-semibold">R{idx + 1}</span>
                          <span className="font-mono font-bold text-neon-green">
                            ${zone.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-neon-cyan/10 border-2 border-neon-cyan/40 shadow-neon-md">
                    <h4 className="text-sm font-bold text-neon-cyan mb-3 flex items-center gap-2 neon-text">
                      <TrendingDown className="w-5 h-5" />
                      Support Zones
                    </h4>
                    <div className="space-y-2">
                      {selectedMarket.analysis.supportZones.map((zone, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-card/50 border border-neon-cyan/30">
                          <span className="text-muted-foreground font-semibold">S{idx + 1}</span>
                          <span className="font-mono font-bold text-neon-cyan">
                            ${zone.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "p-6 rounded-lg border-2 mt-4 transition-all duration-300",
                  isPositive 
                    ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish" 
                    : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                )}>
                  <h4 className="text-sm font-bold mb-2 text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Price Prediction
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-4xl font-bold",
                      isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                    )}>
                      ${selectedMarket.analysis.prediction.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">next 24h</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on algorithmic analysis of SMC, Volume Delta, Liquidity and Fair Value Gaps
                    {hasLearning && ' with continuous learning optimization'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
