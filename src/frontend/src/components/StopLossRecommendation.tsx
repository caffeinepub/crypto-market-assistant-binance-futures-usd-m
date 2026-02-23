import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { MonitoredTrade } from '@/lib/tradeStorage';
import { calculateStopLoss } from '@/lib/stopLossCalculation';
import { calculateTakeProfitZones, getVolatilityFactor } from '@/lib/takeProfitCalculation';

interface StopLossRecommendationProps {
  trade: MonitoredTrade;
  currentPrice: number;
}

export default function StopLossRecommendation({ trade, currentPrice }: StopLossRecommendationProps) {
  const volatilityFactor = getVolatilityFactor();

  const tpZones = calculateTakeProfitZones({
    entryPrice: trade.entryPrice,
    direction: trade.direction,
    volatilityFactor,
  });

  const stopLoss = calculateStopLoss({
    entryPrice: trade.entryPrice,
    direction: trade.direction,
    volatilityFactor,
    takeProfitPrices: {
      tp1: tpZones[0].price,
      tp2: tpZones[1].price,
      tp3: tpZones[2].price,
    },
  });

  return (
    <Card className="border-2 border-neon-red/30 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-neon-red flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Stop Loss Recomendado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg border-2 border-neon-red/30 bg-neon-red/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Preço Recomendado</p>
              <p className="text-2xl font-mono font-bold text-neon-red">${stopLoss.price.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Distância</p>
              <p className="text-xl font-bold text-neon-red">-{stopLoss.percentage.toFixed(2)}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Distância do preço atual: ${Math.abs(stopLoss.price - currentPrice).toFixed(2)}
          </p>
        </div>

        {/* Risk-Reward Ratios */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Relação Risco/Retorno</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-background/50 text-center">
              <p className="text-xs text-muted-foreground">TP1</p>
              <p className="text-lg font-bold text-neon-green">
                1:{stopLoss.riskRewardRatios.tp1.toFixed(1)}
              </p>
            </div>
            <div className="p-2 rounded bg-background/50 text-center">
              <p className="text-xs text-muted-foreground">TP2</p>
              <p className="text-lg font-bold text-neon-green">
                1:{stopLoss.riskRewardRatios.tp2.toFixed(1)}
              </p>
            </div>
            <div className="p-2 rounded bg-background/50 text-center">
              <p className="text-xs text-muted-foreground">TP3</p>
              <p className="text-lg font-bold text-neon-green">
                1:{stopLoss.riskRewardRatios.tp3.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
