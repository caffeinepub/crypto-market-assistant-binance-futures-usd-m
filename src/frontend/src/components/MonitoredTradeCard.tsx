import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { MonitoredTrade } from '@/lib/tradeStorage';
import { useMonitoredTrade } from '@/hooks/useMonitoredTrade';

interface MonitoredTradeCardProps {
  trade: MonitoredTrade;
  onSelect: () => void;
  onRemove: () => void;
  isSelected: boolean;
}

export default function MonitoredTradeCard({ trade, onSelect, onRemove, isSelected }: MonitoredTradeCardProps) {
  const tradeData = useMonitoredTrade(trade);

  const elapsedTime = Date.now() - trade.entryTimestamp;
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
  const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const pnl = tradeData?.pnlPercentage || 0;
  const isProfitable = pnl > 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:scale-[1.02] ${
        isSelected
          ? 'border-2 border-neon-cyan shadow-neon-lg'
          : pnl > 0
          ? 'border-2 border-neon-green/30'
          : pnl < 0
          ? 'border-2 border-neon-red/30'
          : 'border-2 border-neon-purple/30'
      } bg-card/80 backdrop-blur-sm`}
      onClick={onSelect}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neon-cyan">{trade.symbol}</h3>
            <Badge
              variant="outline"
              className={
                trade.direction === 'long'
                  ? 'border-neon-green text-neon-green bg-neon-green/10'
                  : 'border-neon-red text-neon-red bg-neon-red/10'
              }
            >
              {trade.direction === 'long' ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {trade.direction.toUpperCase()} {trade.leverage}x
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Entrada:</span>
            <span className="font-mono">${trade.entryPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">PnL:</span>
            <span
              className={`font-bold ${
                isProfitable ? 'text-neon-green' : pnl < 0 ? 'text-neon-red' : 'text-muted-foreground'
              }`}
            >
              {pnl > 0 ? '+' : ''}
              {pnl.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tempo:</span>
            <span className="font-mono text-neon-purple">{timeString}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
