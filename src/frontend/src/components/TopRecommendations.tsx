import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Star, Zap, AlertCircle, Target, Brain } from 'lucide-react';
import { useBinanceMarketData, useRecommendations } from '@/hooks/useQueries';
import PredictiveConfidencePanel from './PredictiveConfidencePanel';
import AIPerformancePanel from './AIPerformancePanel';
import TabFetchErrorState from './TabFetchErrorState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function TopRecommendations() {
  const { data: marketData, isLoading: marketLoading, error: marketError } = useBinanceMarketData();
  const { data: recommendations, isLoading: recsLoading, error: recsError } = useRecommendations();

  const isLoading = marketLoading || recsLoading;
  const error = marketError || recsError;

  if (error) {
    return <TabFetchErrorState error={error} title="Recommendations Unavailable" description="Unable to generate recommendations from live market data. Check your internet connection and try again." />;
  }

  if (isLoading) {
    return (
      <Card className="border-2 border-border bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get top recommendations with market data
  const topRecs = recommendations
    ?.map((rec) => {
      const market = marketData?.find((m) => m.symbol === rec.symbol);
      return { ...rec, market };
    })
    .filter((rec) => rec.market)
    .slice(0, 10);

  const hasRecommendations = topRecs && topRecs.length > 0;

  return (
    <Card className="border-2 border-neon-green/30 bg-card/60 backdrop-blur-sm shadow-neon-bullish">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-neon-green fill-neon-green animate-pulse-bullish" />
          <CardTitle className="text-2xl text-neon-green neon-text-bullish">Top Recommendations</CardTitle>
        </div>
        <CardDescription className="text-base">
          Assets with highest upside potential based on advanced algorithmic analysis, predictive confidence and continuous learning
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasRecommendations ? (
          <Alert className="border-2 border-neon-cyan/40 bg-neon-cyan/10">
            <AlertCircle className="h-5 w-5 text-neon-cyan" />
            <AlertTitle className="text-neon-cyan font-bold">Generating Recommendations</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              The system is analyzing live market data and generating recommendations automatically.
              Recommendations will appear shortly based on Smart Money Concepts, Volume Delta, 
              Liquidity analysis, institutional order detection and continuous AI learning.
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[700px] pr-2 overflow-x-hidden">
            <div className="space-y-4 min-w-0">
              {topRecs.map((rec, index) => {
                const isHighConfidence = rec.confidence >= 0.7;
                const hasLearning = rec.market && (rec.market.analysis.learningLevel || 0) >= 0.6;
                return (
                  <Card
                    key={`${rec.symbol}-${rec.timestamp}`}
                    className={cn(
                      'border-2 bg-gradient-to-br from-card/80 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 min-w-0',
                      isHighConfidence 
                        ? 'to-neon-green/10 border-neon-green/50 shadow-neon-bullish animate-pulse-bullish' 
                        : 'to-neon-cyan/10 border-neon-green/40 hover:shadow-neon-bullish'
                    )}
                  >
                    <CardContent className="p-4 sm:p-6 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4 min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className={cn(
                              "absolute inset-0 blur-lg opacity-60 rounded-full",
                              isHighConfidence ? "bg-neon-green" : "bg-neon-cyan"
                            )} />
                            <div className={cn(
                              "relative text-primary-foreground font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center border-2",
                              isHighConfidence 
                                ? "bg-gradient-to-br from-neon-green to-neon-cyan border-neon-green shadow-neon-bullish" 
                                : "bg-gradient-to-br from-neon-cyan to-neon-blue border-neon-cyan"
                            )}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-xl text-neon-green neon-text-bullish truncate">{rec.symbol}</h3>
                              {hasLearning && (
                                <Brain className="w-5 h-5 text-neon-purple flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground font-medium truncate">
                              Binance Futures USD-M
                              {hasLearning && ' • AI Advanced'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end flex-shrink-0">
                          <Badge className={cn(
                            'text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 border-2 font-bold whitespace-nowrap',
                            isHighConfidence 
                              ? 'bg-neon-green/20 text-neon-green border-neon-green/60 shadow-neon-bullish' 
                              : 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60'
                          )}>
                            <Zap className="w-4 sm:w-5 h-4 sm:h-5 mr-1 fill-current" />
                            {rec.strength.toFixed(0)}%
                          </Badge>
                          <Badge className={cn(
                            'text-xs sm:text-sm px-2 sm:px-3 py-1 border-2 font-bold whitespace-nowrap',
                            isHighConfidence 
                              ? 'bg-neon-green/20 text-neon-green border-neon-green/60' 
                              : 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60'
                          )}>
                            <Target className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                            {Math.round(rec.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>

                      {rec.market && (
                        <>
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 min-w-0">
                            <div className="space-y-1 p-2 sm:p-3 rounded-lg bg-accent/30 border border-neon-cyan/30 min-w-0">
                              <p className="text-xs text-muted-foreground font-medium">Current Price</p>
                              <p className="text-base sm:text-lg font-bold text-neon-cyan truncate">
                                ${parseFloat(rec.market.lastPrice).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div className="space-y-1 p-2 sm:p-3 rounded-lg bg-neon-green/10 border border-neon-green/40 min-w-0">
                              <p className="text-xs text-muted-foreground font-medium">24h Change</p>
                              <div className="flex items-center gap-1 min-w-0">
                                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-neon-green flex-shrink-0" />
                                <p className="text-base sm:text-lg font-bold text-neon-green truncate">
                                  {rec.market.priceChangePercent.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1 p-2 sm:p-3 rounded-lg bg-accent/30 border border-neon-blue/30 min-w-0">
                              <p className="text-xs text-muted-foreground font-medium">24h Volume</p>
                              <p className="text-base sm:text-lg font-bold text-neon-blue truncate">
                                ${(parseFloat(rec.market.quoteVolume) / 1000000).toFixed(1)}M
                              </p>
                            </div>
                            <div className="space-y-1 p-2 sm:p-3 rounded-lg bg-accent/30 border border-neon-purple/30 min-w-0">
                              <p className="text-xs text-muted-foreground font-medium">Prediction</p>
                              <p className="text-base sm:text-lg font-bold text-neon-purple truncate">
                                ${rec.market.analysis.prediction.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4 min-w-0">
                            <PredictiveConfidencePanel 
                              analysis={rec.market.analysis} 
                              symbol={rec.symbol} 
                              compact 
                            />
                          </div>

                          {hasLearning && (
                            <div className="mb-4 min-w-0">
                              <AIPerformancePanel symbol={rec.symbol} compact />
                            </div>
                          )}

                          {(rec.market.analysis.manipulationZones.length > 0 || rec.market.analysis.institutionalOrders.length > 0) && (
                            <div className="flex flex-wrap gap-2 mb-4 min-w-0">
                              {rec.market.analysis.manipulationZones.length > 0 && (
                                <Badge className="bg-neon-orange/20 text-neon-orange border border-neon-orange/60 text-xs">
                                  <img 
                                    src="/assets/generated/manipulation-zone-icon-transparent.dim_48x48.png" 
                                    alt="" 
                                    className="w-3 h-3 mr-1"
                                  />
                                  {rec.market.analysis.manipulationZones.length} Manipulation Zone{rec.market.analysis.manipulationZones.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                              {rec.market.analysis.institutionalOrders.length > 0 && (
                                <Badge className="bg-neon-purple/20 text-neon-purple border border-neon-purple/60 text-xs">
                                  <img 
                                    src="/assets/generated/institutional-order-icon-transparent.dim_48x48.png" 
                                    alt="" 
                                    className="w-3 h-3 mr-1"
                                  />
                                  {rec.market.analysis.institutionalOrders.length} Institutional Order{rec.market.analysis.institutionalOrders.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="space-y-2 min-w-0">
                            <h4 className="text-sm font-bold text-neon-cyan">Key Indicators:</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.market.analysis.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-neon-cyan/40 text-neon-cyan">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed break-words">
                              Strong {rec.market.analysis.trend} trend detected with {rec.strength.toFixed(0)}% strength. 
                              Technical analysis shows {rec.market.analysis.confidence >= 0.7 ? 'high' : 'moderate'} confidence 
                              based on price action, volume analysis, and market structure.
                              {hasLearning && ' Enhanced by AI learning from historical predictions.'}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
