import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle2 } from 'lucide-react';
import { MonitoredTrade } from '@/lib/tradeStorage';
import { calculateTakeProfitZones, getVolatilityFactor } from '@/lib/takeProfitCalculation';

interface TakeProfitZonesProps {
  trade: MonitoredTrade;
  currentPrice: number;
}

export default function TakeProfitZones({ trade, currentPrice }: TakeProfitZonesProps) {
  // Calculate volatility factor (simplified - could use ATR from market data)
  const volatilityFactor = getVolatilityFactor();

  const zones = calculateTakeProfitZones({
    entryPrice: trade.entryPrice,
    direction: trade.direction,
    volatilityFactor,
  });

  const isZoneReached = (zonePrice: number) => {
    if (trade.direction === 'long') {
      return currentPrice >= zonePrice;
    } else {
      return currentPrice <= zonePrice;
    }
  };

  return (
    <Card className="border-2 border-neon-green/30 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-neon-green flex items-center gap-2">
          <Target className="h-5 w-5" />
          Zonas de Realização (Take Profit)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {zones.map((zone) => {
          const reached = isZoneReached(zone.price);
          return (
            <div
              key={zone.level}
              className={`p-4 rounded-lg border-2 transition-all ${
                reached
                  ? 'border-neon-green bg-neon-green/10'
                  : 'border-neon-green/30 bg-neon-green/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {reached && <CheckCircle2 className="h-5 w-5 text-neon-green" />}
                  <div>
                    <p className="font-bold text-neon-green">{zone.level}</p>
                    <p className="text-xs text-muted-foreground">
                      +{zone.percentageGain.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-bold">${zone.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {reached ? 'Atingido!' : `Faltam $${Math.abs(zone.price - currentPrice).toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
