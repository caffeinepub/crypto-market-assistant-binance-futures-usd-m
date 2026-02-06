import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BinanceMarketData } from '@/hooks/useQueries';

interface MarketCardProps {
  market: BinanceMarketData;
  isSelected: boolean;
  onClick: () => void;
}

export default function MarketCard({ market, isSelected, onClick }: MarketCardProps) {
  const isPositive = market.priceChangePercent >= 0;
  const isHighConfidence = market.analysis.confidence >= 0.7;
  const confidencePercent = Math.round(market.analysis.confidence * 100);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:scale-105 border-2 bg-card/60 backdrop-blur-sm',
        isSelected && 'ring-4 ring-neon-cyan shadow-neon-md',
        isPositive 
          ? 'border-neon-green/40 hover:border-neon-green/70 hover:shadow-neon-bullish' 
          : 'border-neon-red/40 hover:border-neon-red/70 hover:shadow-neon-bearish',
        isPositive && isSelected && 'neon-border-bullish',
        !isPositive && isSelected && 'neon-border-bearish',
        isHighConfidence && 'ring-2 ring-neon-green/30'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className={cn(
              "font-bold text-lg",
              isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
            )}>
              {market.symbol}
            </h3>
            <p className="text-xs text-muted-foreground">Binance Futures</p>
          </div>
          <div className={cn(
            "p-2 rounded-full transition-all duration-300",
            isPositive 
              ? "bg-neon-green/20 shadow-neon-bullish" 
              : "bg-neon-red/20 shadow-neon-bearish"
          )}>
            {isPositive ? (
              <TrendingUp className="w-6 h-6 text-neon-green" />
            ) : (
              <TrendingDown className="w-6 h-6 text-neon-red" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              ${parseFloat(market.lastPrice).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <Badge
            variant={isPositive ? 'default' : 'destructive'}
            className={cn(
              'w-full justify-center text-base font-bold border-2 transition-all duration-300',
              isPositive 
                ? 'bg-neon-green/20 text-neon-green border-neon-green/60 hover:bg-neon-green/30 hover:shadow-neon-bullish' 
                : 'bg-neon-red/20 text-neon-red border-neon-red/60 hover:bg-neon-red/30 hover:shadow-neon-bearish'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-5 h-5 mr-1" />
            ) : (
              <TrendingDown className="w-5 h-5 mr-1" />
            )}
            {market.priceChangePercent.toFixed(2)}%
          </Badge>

          <div className="pt-2 border-t-2 border-border space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">Volume 24h</span>
              <span className="font-bold text-neon-cyan">
                ${(parseFloat(market.quoteVolume) / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">Força</span>
              <span className={cn(
                "font-bold",
                isPositive ? "text-neon-green" : "text-neon-orange"
              )}>
                {market.analysis.strength.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-muted-foreground font-medium">Confiança</span>
              <Badge className={cn(
                'text-xs px-2 py-0.5 border font-bold',
                isHighConfidence 
                  ? 'bg-neon-green/20 text-neon-green border-neon-green/60' 
                  : 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60'
              )}>
                <Zap className="w-3 h-3 mr-0.5" />
                {confidencePercent}%
              </Badge>
            </div>
          </div>

          {isHighConfidence && (
            <div className="pt-2">
              <div className="relative w-full h-1.5 bg-muted rounded-full border border-border overflow-hidden">
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-green via-neon-cyan to-neon-purple transition-all duration-500"
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
