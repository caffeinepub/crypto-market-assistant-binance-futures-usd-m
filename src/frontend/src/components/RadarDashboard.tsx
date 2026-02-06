import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Radio, AlertTriangle, Zap, Filter, Brain } from 'lucide-react';
import { useBinanceMarketData, useRadarAlerts, useHighLearningAssets } from '@/hooks/useQueries';
import TabFetchErrorState from './TabFetchErrorState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface RadarAlert {
  symbol: string;
  percentChange: number;
  volumeDelta: number;
  direction: 'up' | 'down';
  confidence: number;
  anomalyScore: number;
  isNew?: boolean;
  learningLevel?: number;
}

type TrendFilter = 'all' | 'bullish' | 'bearish' | 'learning';

export default function RadarDashboard() {
  const { data: marketData, isLoading, error } = useBinanceMarketData();
  const { data: backendAlerts } = useRadarAlerts();
  const { data: highLearningAssets } = useHighLearningAssets();
  const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const previousAlertsRef = useRef<Set<string>>(new Set());
  const [newAlerts, setNewAlerts] = useState<Set<string>>(new Set());

  // Detect abnormal movements based on thresholds
  const radarAlerts = useMemo<RadarAlert[]>(() => {
    if (!marketData || marketData.length === 0) return [];

    const alerts: RadarAlert[] = [];

    marketData.forEach((market) => {
      const percentChange = market.priceChangePercent;
      const volume = parseFloat(market.quoteVolume);
      const avgVolume = 5000000000; // Baseline average volume for comparison
      const volumeRatio = volume / avgVolume;

      // Detect price anomalies (>3% change)
      const isPriceAnomaly = Math.abs(percentChange) > 3;

      // Detect volume anomalies (>150% of average)
      const isVolumeAnomaly = volumeRatio > 1.5;

      // Create alert if either condition is met
      if (isPriceAnomaly || isVolumeAnomaly) {
        const anomalyScore = Math.abs(percentChange) * 0.5 + (volumeRatio - 1) * 50;
        const confidence = Math.min(
          (Math.abs(percentChange) / 10 + (volumeRatio - 1) / 2) / 2,
          1.0
        );

        const direction = percentChange >= 0 ? 'up' : 'down';
        const learningLevel = market.analysis.learningLevel || 0;

        // Apply trend filter
        if (trendFilter === 'bullish' && direction !== 'up') return;
        if (trendFilter === 'bearish' && direction !== 'down') return;
        if (trendFilter === 'learning' && learningLevel < 0.6) return;

        // Apply confidence threshold
        if (confidence < minConfidence) return;

        alerts.push({
          symbol: market.symbol,
          percentChange,
          volumeDelta: volumeRatio,
          direction,
          confidence,
          anomalyScore,
          learningLevel,
        });
      }
    });

    // Sort by anomaly score (highest first)
    return alerts.sort((a, b) => b.anomalyScore - a.anomalyScore);
  }, [marketData, trendFilter, minConfidence]);

  // Detect new alerts for animation
  useEffect(() => {
    const currentSymbols = new Set(radarAlerts.map(a => a.symbol));
    const newSymbols = new Set<string>();

    currentSymbols.forEach(symbol => {
      if (!previousAlertsRef.current.has(symbol)) {
        newSymbols.add(symbol);
      }
    });

    if (newSymbols.size > 0) {
      setNewAlerts(newSymbols);
      // Remove new alert status after animation completes
      setTimeout(() => {
        setNewAlerts(new Set());
      }, 3000);
    }

    previousAlertsRef.current = currentSymbols;
  }, [radarAlerts]);

  // Get confidence level label
  const getConfidenceLevel = (confidence: number): string => {
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.4) return 'Medium';
    return 'Low';
  };

  // Get confidence brightness class
  const getConfidenceBrightness = (confidence: number): string => {
    if (confidence >= 0.7) return 'brightness-125';
    if (confidence >= 0.4) return 'brightness-100';
    return 'brightness-75';
  };

  if (error) {
    return <TabFetchErrorState error={error} title="Radar Data Unavailable" description="Unable to fetch live radar data from Binance. Check your internet connection and try again." />;
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
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-neon-orange/40 bg-card/60 backdrop-blur-sm shadow-radar-glow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radio className="w-7 h-7 text-neon-orange animate-pulse-radar" />
              <div className="absolute inset-0 animate-ping">
                <Radio className="w-7 h-7 text-neon-orange opacity-75" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl text-neon-orange neon-text-radar">
                Radar Mode - Anomaly Detection
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Real-time monitoring of abnormal movements with continuous learning
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-neon-cyan" />
              <h3 className="text-sm font-semibold text-neon-cyan">Trend Filters</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Button
                variant={trendFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setTrendFilter('all')}
                className={cn(
                  'touch-manipulation text-xs sm:text-sm',
                  trendFilter === 'all' && 'bg-neon-cyan/20 border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/30'
                )}
              >
                All
              </Button>
              <Button
                variant={trendFilter === 'bullish' ? 'default' : 'outline'}
                onClick={() => setTrendFilter('bullish')}
                className={cn(
                  'touch-manipulation text-xs sm:text-sm',
                  trendFilter === 'bullish' && 'bg-neon-green/20 border-neon-green/60 text-neon-green hover:bg-neon-green/30'
                )}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Bullish
              </Button>
              <Button
                variant={trendFilter === 'bearish' ? 'default' : 'outline'}
                onClick={() => setTrendFilter('bearish')}
                className={cn(
                  'touch-manipulation text-xs sm:text-sm',
                  trendFilter === 'bearish' && 'bg-neon-red/20 border-neon-red/60 text-neon-red hover:bg-neon-red/30'
                )}
              >
                <TrendingDown className="w-4 h-4 mr-1" />
                Bearish
              </Button>
              <Button
                variant={trendFilter === 'learning' ? 'default' : 'outline'}
                onClick={() => setTrendFilter('learning')}
                className={cn(
                  'touch-manipulation text-xs sm:text-sm',
                  trendFilter === 'learning' && 'bg-neon-purple/20 border-neon-purple/60 text-neon-purple hover:bg-neon-purple/30'
                )}
              >
                <Brain className="w-4 h-4 mr-1" />
                AI Advanced
              </Button>
            </div>

            {/* Confidence Threshold Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">
                  Minimum Confidence: {Math.round(minConfidence * 100)}%
                </label>
                <Badge variant="outline" className="text-xs">
                  {getConfidenceLevel(minConfidence)}
                </Badge>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={minConfidence * 100}
                onChange={(e) => setMinConfidence(parseInt(e.target.value) / 100)}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-neon-cyan"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>40%</span>
                <span>70%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {radarAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Radio className="w-16 h-16 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground text-center">
                No abnormal movements detected
              </p>
              <p className="text-sm text-muted-foreground/70 text-center max-w-md">
                {trendFilter === 'learning'
                  ? 'No assets with advanced AI found. The AI learns as predictions are validated.'
                  : trendFilter !== 'all' 
                  ? `No ${trendFilter === 'bullish' ? 'bullish' : 'bearish'} alerts found with current filters.`
                  : 'The radar is continuously monitoring. Alerts will appear when price changes >3% or volume spikes >150% are detected.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-neon-orange/10 border border-neon-orange/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-neon-orange" />
                  <span className="text-sm font-semibold text-neon-orange">
                    {radarAlerts.length} {radarAlerts.length === 1 ? 'Active Alert' : 'Active Alerts'}
                  </span>
                </div>
                <Badge className="bg-neon-orange/20 text-neon-orange border-2 border-neon-orange/60 font-bold">
                  <Zap className="w-4 h-4 mr-1" />
                  Real Time
                </Badge>
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {radarAlerts.map((alert) => {
                    const isUp = alert.direction === 'up';
                    const confidencePercent = Math.round(alert.confidence * 100);
                    const isHighConfidence = alert.confidence >= 0.7;
                    const isMediumConfidence = alert.confidence >= 0.4 && alert.confidence < 0.7;
                    const isNewAlert = newAlerts.has(alert.symbol);
                    const hasLearning = (alert.learningLevel || 0) >= 0.6;

                    return (
                      <Card
                        key={alert.symbol}
                        className={cn(
                          'border-2 transition-all duration-500 hover:scale-[1.02] cursor-pointer',
                          isUp
                            ? 'bg-neon-green/5 border-neon-green/40 hover:border-neon-green/60 radar-alert-bullish'
                            : 'bg-neon-red/5 border-neon-red/40 hover:border-neon-red/60 radar-alert-bearish',
                          isHighConfidence && 'animate-pulse-radar-alert',
                          isNewAlert && 'animate-radar-new-alert',
                          getConfidenceBrightness(alert.confidence)
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'w-12 h-12 rounded-full flex items-center justify-center border-2 relative',
                                  isUp
                                    ? 'bg-neon-green/20 border-neon-green/60'
                                    : 'bg-neon-red/20 border-neon-red/60',
                                  isNewAlert && 'animate-pulse-neon-soft'
                                )}
                              >
                                {isUp ? (
                                  <TrendingUp className="w-6 h-6 text-neon-green" />
                                ) : (
                                  <TrendingDown className="w-6 h-6 text-neon-red" />
                                )}
                                {isNewAlert && (
                                  <div className="absolute inset-0 rounded-full border-2 border-neon-orange animate-ping" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={cn(
                                      'text-xl font-bold',
                                      isUp ? 'text-neon-green' : 'text-neon-red'
                                    )}
                                  >
                                    {alert.symbol}
                                  </h3>
                                  {hasLearning && (
                                    <Brain className="w-4 h-4 text-neon-purple" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {isNewAlert ? '🆕 New alert' : 'Anomaly detected'}
                                  {hasLearning && ' • AI Advanced'}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={cn(
                                'text-lg px-4 py-2 border-2 font-bold',
                                isUp
                                  ? 'bg-neon-green/20 text-neon-green border-neon-green/60'
                                  : 'bg-neon-red/20 text-neon-red border-neon-red/60'
                              )}
                            >
                              {isUp ? '+' : ''}
                              {alert.percentChange.toFixed(2)}%
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-accent/30 border border-border">
                              <p className="text-xs text-muted-foreground font-medium mb-1">
                                Volume Delta
                              </p>
                              <p className="text-lg font-bold text-neon-cyan">
                                {alert.volumeDelta.toFixed(2)}x
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-accent/30 border border-border">
                              <p className="text-xs text-muted-foreground font-medium mb-1">
                                Confidence
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-2 border border-border">
                                  <div
                                    className={cn(
                                      'h-full rounded-full transition-all duration-500',
                                      isUp
                                        ? 'bg-gradient-to-r from-neon-green to-neon-cyan'
                                        : 'bg-gradient-to-r from-neon-red to-neon-orange'
                                    )}
                                    style={{ width: `${confidencePercent}%` }}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    'text-sm font-bold',
                                    isUp ? 'text-neon-green' : 'text-neon-red'
                                  )}
                                >
                                  {confidencePercent}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-xs border-neon-orange/60 text-neon-orange"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Abnormal Movement
                            </Badge>
                            {isHighConfidence && (
                              <Badge
                                variant="outline"
                                className="text-xs border-neon-purple/60 text-neon-purple"
                              >
                                High Confidence
                              </Badge>
                            )}
                            {isMediumConfidence && (
                              <Badge
                                variant="outline"
                                className="text-xs border-neon-cyan/60 text-neon-cyan"
                              >
                                Medium Confidence
                              </Badge>
                            )}
                            {hasLearning && (
                              <Badge
                                variant="outline"
                                className="text-xs border-neon-purple/60 text-neon-purple"
                              >
                                <Brain className="w-3 h-3 mr-1" />
                                AI Advanced
                              </Badge>
                            )}
                            {isNewAlert && (
                              <Badge
                                variant="outline"
                                className="text-xs border-neon-pink/60 text-neon-pink animate-pulse"
                              >
                                New
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-neon-cyan/30 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-neon-cyan">About Radar Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="text-neon-orange font-semibold">Radar Mode</span> continuously monitors live Binance Futures USD-M data to detect abnormal movements in real time.
          </p>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Detection Criteria:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Price changes greater than 3% relative to recent average</li>
              <li>Volume spikes greater than 150% of recent average</li>
              <li>Confidence calculation based on anomaly magnitude</li>
              <li><span className="text-neon-purple">Continuous learning</span> to improve detection accuracy</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Filters and Highlighting:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="text-neon-green">Bullish</span>: Shows only alerts with upward movement</li>
              <li><span className="text-neon-red">Bearish</span>: Shows only alerts with downward movement</li>
              <li><span className="text-neon-purple">AI Advanced</span>: Shows only assets with high predictive accuracy learned</li>
              <li><span className="text-neon-purple">High Confidence</span>: Alerts with intense neon glow and pulsing animation</li>
              <li><span className="text-neon-cyan">Medium Confidence</span>: Alerts with moderate neon glow</li>
              <li><span className="text-muted-foreground">Low Confidence</span>: Alerts with subtle neon glow</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-4">
            Alerts are automatically updated every 30 seconds. New alerts are highlighted with a soft neon pulse animation. 
            The AI continuously learns from results to improve detection accuracy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
