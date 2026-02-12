import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, Radio, AlertTriangle, Zap, Filter, Brain, Activity, DollarSign, TrendingUpDown, RotateCcw, Gauge } from 'lucide-react';
import { useBinanceMarketData, useRadarAlerts, useHighLearningAssets, RadarAlert } from '@/hooks/useQueries';
import { AnomalyType } from '@/hooks/queries/localSignals';
import { useRadarSensitivity } from '@/hooks/useRadarSensitivity';
import { loadFilters, saveFilters, resetFilters, getAllAnomalyTypes } from '@/lib/radarFilters';
import TabFetchErrorState from './TabFetchErrorState';
import TabPageCard from './TabPageCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type TrendFilter = 'all' | 'bullish' | 'bearish' | 'learning';

const anomalyTypeLabels: Record<AnomalyType, string> = {
  price_move: 'Price Move',
  volume_spike: 'Volume Spike',
  extreme_volatility: 'Extreme Volatility',
  funding_irregularity: 'Funding Alert',
  open_interest_spike: 'OI Spike',
};

const anomalyTypeIcons: Record<AnomalyType, React.ReactNode> = {
  price_move: <TrendingUpDown className="h-3 w-3" />,
  volume_spike: <Activity className="h-3 w-3" />,
  extreme_volatility: <Zap className="h-3 w-3" />,
  funding_irregularity: <DollarSign className="h-3 w-3" />,
  open_interest_spike: <TrendingUp className="h-3 w-3" />,
};

export default function RadarDashboard() {
  const { data: marketData, isLoading, error } = useBinanceMarketData();
  const { data: radarAlerts, isLoading: alertsLoading } = useRadarAlerts();
  const { data: highLearningAssets } = useHighLearningAssets();
  const { preset, setPreset } = useRadarSensitivity();
  
  const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');
  const [minConfidence, setMinConfidence] = useState<number>(0);
  
  // Load filters from localStorage
  const [enabledAnomalyTypes, setEnabledAnomalyTypes] = useState<Set<AnomalyType>>(() => {
    const filters = loadFilters();
    return filters.enabledAnomalyTypes;
  });
  const [minAnomalyScore, setMinAnomalyScore] = useState<number>(() => {
    const filters = loadFilters();
    return filters.minAnomalyScore;
  });
  
  const previousAlertsRef = useRef<Set<string>>(new Set());
  const [newAlerts, setNewAlerts] = useState<Set<string>>(new Set());

  // Save filters to localStorage when they change
  useEffect(() => {
    saveFilters({
      enabledAnomalyTypes,
      minAnomalyScore,
      minConfidence,
    });
  }, [enabledAnomalyTypes, minAnomalyScore, minConfidence]);

  // Mark new alerts
  useEffect(() => {
    if (!radarAlerts) return;

    const currentAlertKeys = new Set(radarAlerts.map((a) => `${a.symbol}-${a.timestamp}`));
    const newKeys = new Set<string>();

    radarAlerts.forEach((alert) => {
      const key = `${alert.symbol}-${alert.timestamp}`;
      if (!previousAlertsRef.current.has(key)) {
        newKeys.add(key);
      }
    });

    setNewAlerts(newKeys);
    previousAlertsRef.current = currentAlertKeys;

    // Clear new alert markers after 10 seconds
    const timer = setTimeout(() => {
      setNewAlerts(new Set());
    }, 10000);

    return () => clearTimeout(timer);
  }, [radarAlerts]);

  // Enrich alerts with learning data
  const enrichedAlerts = useMemo(() => {
    if (!radarAlerts || !marketData) return [];

    return radarAlerts.map((alert) => {
      const market = marketData.find((m) => m.symbol === alert.symbol);
      const learningLevel = market?.analysis.learningLevel || 0;
      const isHighLearning = highLearningAssets?.includes(alert.symbol) || false;
      const alertKey = `${alert.symbol}-${alert.timestamp}`;
      const isNew = newAlerts.has(alertKey);

      return {
        ...alert,
        learningLevel,
        isHighLearning,
        isNew,
      };
    });
  }, [radarAlerts, marketData, highLearningAssets, newAlerts]);

  // Apply filters
  const filteredAlerts = useMemo(() => {
    let filtered = enrichedAlerts;

    // Trend filter
    if (trendFilter === 'bullish') {
      filtered = filtered.filter((a) => a.direction === 'up');
    } else if (trendFilter === 'bearish') {
      filtered = filtered.filter((a) => a.direction === 'down');
    } else if (trendFilter === 'learning') {
      filtered = filtered.filter((a) => a.isHighLearning);
    }

    // Confidence filter
    filtered = filtered.filter((a) => a.confidence >= minConfidence);
    
    // Anomaly type filter
    filtered = filtered.filter((a) => 
      a.anomalyTypes.some(type => enabledAnomalyTypes.has(type))
    );
    
    // Anomaly score filter
    filtered = filtered.filter((a) => a.anomalyScore >= minAnomalyScore);

    return filtered;
  }, [enrichedAlerts, trendFilter, minConfidence, enabledAnomalyTypes, minAnomalyScore]);

  const handleResetFilters = () => {
    const defaults = resetFilters();
    setEnabledAnomalyTypes(defaults.enabledAnomalyTypes);
    setMinAnomalyScore(defaults.minAnomalyScore);
    setMinConfidence(defaults.minConfidence);
    setTrendFilter('all');
  };

  const toggleAnomalyType = (type: AnomalyType) => {
    setEnabledAnomalyTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  if (error) {
    return <TabFetchErrorState />;
  }

  if (isLoading || alertsLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
            <div className="space-y-3 mt-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TabPageCard
        icon={<Radio className="w-6 h-6 text-neon-cyan animate-pulse-neon" />}
        title="Radar Detection"
        description="Real-time anomaly monitoring with AI learning"
        badge={
          <Badge variant="outline" className="text-lg px-4 py-2">
            {filteredAlerts.length} Active
          </Badge>
        }
      >
        <div className="space-y-6">
          {/* Sensitivity Selector */}
          <Card className="border-border bg-card/40">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sensitivity:</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={preset === 'conservative' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreset('conservative')}
                  >
                    Conservative
                  </Button>
                  <Button
                    variant={preset === 'balanced' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreset('balanced')}
                  >
                    Balanced
                  </Button>
                  <Button
                    variant={preset === 'aggressive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreset('aggressive')}
                  >
                    Aggressive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>

                  {/* Trend Filter */}
                  <div className="flex gap-2">
                    <Button
                      variant={trendFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrendFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={trendFilter === 'bullish' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrendFilter('bullish')}
                      className="gap-1"
                    >
                      <TrendingUp className="h-3 w-3" />
                      Bullish
                    </Button>
                    <Button
                      variant={trendFilter === 'bearish' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrendFilter('bearish')}
                      className="gap-1"
                    >
                      <TrendingDown className="h-3 w-3" />
                      Bearish
                    </Button>
                    <Button
                      variant={trendFilter === 'learning' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrendFilter('learning')}
                      className="gap-1"
                    >
                      <Brain className="h-3 w-3" />
                      Learning
                    </Button>
                  </div>

                  {/* Confidence Filter */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-muted-foreground">Min Confidence:</span>
                    <div className="flex gap-1">
                      {[0, 0.3, 0.5, 0.7].map((threshold) => (
                        <Button
                          key={threshold}
                          variant={minConfidence === threshold ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMinConfidence(threshold)}
                        >
                          {threshold === 0 ? 'All' : `${(threshold * 100).toFixed(0)}%`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Anomaly Type Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Anomaly Types:</Label>
                  <div className="flex flex-wrap gap-3">
                    {getAllAnomalyTypes().map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`anomaly-${type}`}
                          checked={enabledAnomalyTypes.has(type)}
                          onCheckedChange={() => toggleAnomalyType(type)}
                        />
                        <Label
                          htmlFor={`anomaly-${type}`}
                          className="text-sm cursor-pointer flex items-center gap-1"
                        >
                          {anomalyTypeIcons[type]}
                          {anomalyTypeLabels[type]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity Filter */}
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">Min Severity:</Label>
                  <div className="flex gap-1">
                    {[0, 0.5, 1.0, 1.5].map((threshold) => (
                      <Button
                        key={threshold}
                        variant={minAnomalyScore === threshold ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMinAnomalyScore(threshold)}
                      >
                        {threshold === 0 ? 'All' : threshold.toFixed(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="gap-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Radio className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No anomalies detected matching your filters.
                      <br />
                      <span className="text-sm">The radar is actively monitoring the market.</span>
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAlerts.map((alert) => (
                  <Card
                    key={`${alert.symbol}-${alert.timestamp}`}
                    className={cn(
                      'border-l-4 transition-all hover:shadow-lg',
                      alert.direction === 'up' ? 'border-l-green-500' : 'border-l-red-500',
                      alert.isNew && 'animate-fadeInScale shadow-primary/20 shadow-lg'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Symbol and Direction */}
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'rounded-full p-2',
                              alert.direction === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'
                            )}
                          >
                            {alert.direction === 'up' ? (
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold">{alert.symbol}</h3>
                              {alert.isNew && (
                                <Badge variant="destructive" className="animate-pulseGlow">
                                  NEW
                                </Badge>
                              )}
                              {alert.isHighLearning && (
                                <Badge variant="outline" className="gap-1">
                                  <Brain className="h-3 w-3" />
                                  Learning
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={cn(
                                  'text-sm font-semibold',
                                  alert.direction === 'up' ? 'text-green-500' : 'text-red-500'
                                )}
                              >
                                {alert.percentChange > 0 ? '+' : ''}
                                {alert.percentChange.toFixed(2)}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Vol: {alert.volumeDelta.toFixed(1)}x
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Confidence and Score */}
                        <div className="text-right">
                          <div className="text-sm font-medium text-muted-foreground">Confidence</div>
                          <div className="text-2xl font-bold text-primary">
                            {(alert.confidence * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Score: {alert.anomalyScore.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Anomaly Types */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {alert.anomalyTypes.map((type) => (
                          <Badge
                            key={type}
                            variant="secondary"
                            className="gap-1 text-xs"
                          >
                            {anomalyTypeIcons[type]}
                            {anomalyTypeLabels[type]}
                          </Badge>
                        ))}
                      </div>

                      {/* Reasons */}
                      <div className="mt-3 space-y-1">
                        {alert.reasons.map((reason, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </TabPageCard>
    </div>
  );
}
