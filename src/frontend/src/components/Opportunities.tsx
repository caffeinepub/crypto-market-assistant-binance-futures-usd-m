import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Zap, Activity, Target, Eye, Layers } from 'lucide-react';
import { useOpportunities } from '@/hooks/useOpportunities';
import TabFetchErrorState from './TabFetchErrorState';
import TabPageCard from './TabPageCard';

export default function Opportunities() {
  const { data, isLoading, error, dataUpdatedAt } = useOpportunities();

  // Calculate freshness indicator
  const freshnessText = useMemo(() => {
    if (!dataUpdatedAt) return '';
    const ageSeconds = Math.floor((Date.now() - dataUpdatedAt) / 1000);
    if (ageSeconds < 60) return `Updated ${ageSeconds}s ago`;
    const ageMinutes = Math.floor(ageSeconds / 60);
    return `Updated ${ageMinutes}m ago`;
  }, [dataUpdatedAt]);

  if (error) {
    return <TabFetchErrorState error={error} title="Unable to Load Opportunities" description="There was an error loading trading opportunities from live market data." />;
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
            <Skeleton className="h-12 w-full" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle>No Opportunities Available</CardTitle>
          <CardDescription>Live market data is not available at the moment.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const modalityIcons = {
    scalping: Zap,
    swing: Activity,
    breakout: TrendingUp,
    reversal: Target,
    smc: Eye,
    fvg: Layers,
  };

  const modalityDescriptions = {
    scalping: 'Quick trades on small price movements with high volume',
    swing: 'Medium-term positions capturing trend swings',
    breakout: 'Assets breaking key resistance or support levels',
    reversal: 'Potential trend reversals at key price zones',
    smc: 'Smart Money Concepts: institutional order flow detection',
    fvg: 'Fair Value Gaps: imbalance zones for potential fills',
  };

  const renderOpportunityList = (opportunities: typeof data.scalping) => {
    if (opportunities.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No opportunities found matching this modality criteria.</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <Card key={opp.symbol} className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{opp.symbol}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={opp.priceChangePercent >= 0 ? 'default' : 'destructive'} className="text-xs">
                        {opp.priceChangePercent >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {opp.priceChangePercent >= 0 ? '+' : ''}{opp.priceChangePercent.toFixed(2)}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ${parseFloat(opp.lastPrice).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground">Strength</div>
                    <div className="text-lg font-bold text-primary">{opp.strength.toFixed(0)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Reasons:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.reasons.map((reason, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-6">
      <TabPageCard
        icon={<Target className="w-6 h-6 text-neon-cyan animate-pulse-neon" />}
        title="Trading Opportunities"
        description="Live opportunities grouped by trading modality"
        badge={
          freshnessText && (
            <Badge variant="outline" className="text-xs">
              {freshnessText}
            </Badge>
          )
        }
      >
        <Tabs defaultValue="scalping" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {Object.entries(modalityIcons).map(([key, Icon]) => (
              <TabsTrigger key={key} value={key} className="gap-1">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline capitalize">{key}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(data).map(([modality, opportunities]) => {
            const Icon = modalityIcons[modality as keyof typeof modalityIcons];
            return (
              <TabsContent key={modality} value={modality} className="mt-6">
                <Card className="border-border mb-4">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="capitalize">{modality} Trading</CardTitle>
                    </div>
                    <CardDescription>
                      {modalityDescriptions[modality as keyof typeof modalityDescriptions]}
                    </CardDescription>
                  </CardHeader>
                </Card>
                {renderOpportunityList(opportunities)}
              </TabsContent>
            );
          })}
        </Tabs>
      </TabPageCard>
    </div>
  );
}
