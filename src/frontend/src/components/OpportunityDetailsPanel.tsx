import { X, TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';
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
                <h3 className="text-lg font-semibold">Trade Recommendation</h3>
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

                  {/* Entry, TP, SL */}
                  <div className="grid grid-cols-1 gap-3">
                    <Card className="border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Entry Price</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold text-primary">
                          ${result.recommendation.entry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-green-500/20 bg-green-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Take Profit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          ${result.recommendation.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          +
                          {(
                            ((result.recommendation.takeProfit - result.recommendation.entry) /
                              result.recommendation.entry) *
                            100
                          ).toFixed(2)}
                          %
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-red-500/20 bg-red-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Stop Loss</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                          ${result.recommendation.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(
                            ((result.recommendation.stopLoss - result.recommendation.entry) /
                              result.recommendation.entry) *
                            100
                          ).toFixed(2)}
                          %
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Rationale */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Rationale & Signals</CardTitle>
                      <CardDescription>Why this recommendation was generated</CardDescription>
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
                        Recommendation Confidence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-primary transition-all"
                            style={{ width: `${result.recommendation.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(result.recommendation.confidence * 100).toFixed(0)}%
                        </span>
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
