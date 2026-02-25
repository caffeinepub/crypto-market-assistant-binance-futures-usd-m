import { X, TrendingUp, TrendingDown, Target, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTradeRecommendation } from '@/hooks/useTradeRecommendation';
import { useBinanceMarketData } from '@/hooks/useQueries';

interface OpportunityDetailsPanelProps {
  symbol: string;
  modality: string;
  onClose: () => void;
}

export default function OpportunityDetailsPanel({
  symbol,
  modality,
  onClose,
}: OpportunityDetailsPanelProps) {
  const { data: marketData } = useBinanceMarketData();
  const { result, isReady } = useTradeRecommendation({ symbol, modality, marketData });

  // Find current asset data
  const asset = marketData?.find((m) => m.symbol === symbol);
  const currentPrice = asset ? parseFloat(asset.lastPrice) : 0;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-background border-l border-border shadow-2xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{symbol}</h2>
            <p className="text-sm text-muted-foreground capitalize">{modality} Opportunity</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Current Price */}
            {asset && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">${currentPrice.toLocaleString()}</span>
                    <Badge variant={asset.priceChangePercent >= 0 ? 'default' : 'destructive'}>
                      {asset.priceChangePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {asset.priceChangePercent >= 0 ? '+' : ''}
                      {asset.priceChangePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Trade Recommendation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Trade Setup</h3>
              </div>

              {!isReady && (
                <Card className="border-muted">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">Loading recommendation...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isReady && result && !result.success && (
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">Cannot compute recommendation</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.error.reason}</p>
                      {result.error.missingData.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Missing data:</p>
                          <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                            {result.error.missingData.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {isReady && result && result.success && (
                <div className="space-y-4">
                  {/* Direction */}
                  <Card className="border-primary/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Direction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant={result.recommendation.direction === 'Long' ? 'default' : 'destructive'}
                        className="text-lg px-4 py-1"
                      >
                        {result.recommendation.direction === 'Long' ? (
                          <TrendingUp className="h-4 w-4 mr-2" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-2" />
                        )}
                        {result.recommendation.direction}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Entry, TP, SL Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {/* Entry Point */}
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Entry Point
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          ${result.recommendation.entry.toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optimal entry based on technical analysis
                        </p>
                      </CardContent>
                    </Card>

                    {/* Take Profit */}
                    <Card className="border-green-500/30 bg-green-500/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Take Profit Target
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${result.recommendation.takeProfit.toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                        <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1 font-medium">
                          +
                          {(
                            ((result.recommendation.takeProfit - result.recommendation.entry) /
                              result.recommendation.entry) *
                            100
                          ).toFixed(2)}
                          % potential gain
                        </p>
                      </CardContent>
                    </Card>

                    {/* Stop Loss */}
                    <Card className="border-red-500/30 bg-red-500/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Stop Loss
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          ${result.recommendation.stopLoss.toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 font-medium">
                          {(
                            ((result.recommendation.stopLoss - result.recommendation.entry) /
                              result.recommendation.entry) *
                            100
                          ).toFixed(2)}
                          % max loss
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Risk/Reward Ratio */}
                  <Card className="border-border bg-card/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Risk/Reward Ratio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-base px-3 py-1">
                          1 : {result.recommendation.riskRewardRatio.toFixed(2)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {result.recommendation.riskRewardRatio >= 2 
                            ? 'Excellent setup' 
                            : result.recommendation.riskRewardRatio >= 1.5 
                            ? 'Good setup' 
                            : 'Moderate setup'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Separator />

                  {/* Rationale */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Analysis & Rationale</CardTitle>
                      <CardDescription>Technical signals supporting this setup</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.recommendation.rationale.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{reason}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Confidence */}
                  <Card className="border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Setup Confidence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {(result.recommendation.confidence * 100).toFixed(0)}%
                          </span>
                          <Badge
                            variant={
                              result.recommendation.confidence >= 0.7
                                ? 'default'
                                : result.recommendation.confidence >= 0.5
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {result.recommendation.confidence >= 0.7
                              ? 'High'
                              : result.recommendation.confidence >= 0.5
                              ? 'Medium'
                              : 'Low'}
                          </Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-primary transition-all"
                            style={{ width: `${result.recommendation.confidence * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Based on technical analysis, market conditions, and AI learning
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
