import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Shield } from 'lucide-react';
import { MonitoredTrade } from '@/lib/tradeStorage';
import { useMonitoredTrade } from '@/hooks/useMonitoredTrade';
import TakeProfitZones from './TakeProfitZones';
import StopLossRecommendation from './StopLossRecommendation';

interface TradeMonitoringPanelProps {
  trade: MonitoredTrade;
}

export default function TradeMonitoringPanel({ trade }: TradeMonitoringPanelProps) {
  const tradeData = useMonitoredTrade(trade);

  if (!tradeData) return null;

  const { currentPrice, pnlPercentage, liquidationPrice, isLoading } = tradeData;
  const isProfitable = pnlPercentage > 0;

  return (
    <div className="space-y-4">
      {/* Main Stats Card */}
      <Card className="border-2 border-neon-cyan/30 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-neon-cyan flex items-center gap-2">
              {trade.symbol}
              <Badge
                variant="outline"
                className={
                  trade.direction === 'long'
                    ? 'border-neon-green text-neon-green bg-neon-green/10'
                    : 'border-neon-red text-neon-red bg-neon-red/10'
                }
              >
                {trade.direction === 'long' ? (
                  <TrendingUp className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4" />
                )}
                {trade.direction.toUpperCase()} {trade.leverage}x
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Preço de Entrada</p>
              <p className="text-xl font-mono font-bold">${trade.entryPrice.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Preço Atual</p>
              <p className="text-xl font-mono font-bold text-neon-cyan">
                ${currentPrice.toFixed(2)}
                {isLoading && <span className="text-xs ml-2 text-muted-foreground">...</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">PnL</p>
              <p
                className={`text-2xl font-bold ${
                  isProfitable ? 'text-neon-green' : pnlPercentage < 0 ? 'text-neon-red' : 'text-muted-foreground'
                }`}
              >
                {pnlPercentage > 0 ? '+' : ''}
                {pnlPercentage.toFixed(2)}%
              </p>
            </div>
          </div>

          <Separator className="bg-neon-purple/20" />

          {/* Liquidation Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-destructive">Preço de Liquidação</p>
              <p className="text-lg font-mono font-bold">${liquidationPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                Distância:{' '}
                {(Math.abs((currentPrice - liquidationPrice) / currentPrice) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Take Profit Zones */}
      <TakeProfitZones trade={trade} currentPrice={currentPrice} />

      {/* Stop Loss Recommendation */}
      <StopLossRecommendation trade={trade} currentPrice={currentPrice} />
    </div>
  );
}
