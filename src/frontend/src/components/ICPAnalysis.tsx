import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { useBinanceMarketData } from '@/hooks/useQueries';
import PredictiveConfidencePanel from './PredictiveConfidencePanel';
import { cn } from '@/lib/utils';

export default function ICPAnalysis() {
  const { data: marketData, isLoading } = useBinanceMarketData();

  const icpMarket = marketData?.find((m) => m.symbol === 'ICPUSDT');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!icpMarket) {
    return (
      <Card className="border-2 border-border bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>ICP (Internet Computer)</CardTitle>
          <CardDescription>Dados não disponíveis no momento</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isPositive = icpMarket.priceChangePercent >= 0;
  const hasManipulationZones = icpMarket.analysis.manipulationZones.length > 0;
  const hasInstitutionalOrders = icpMarket.analysis.institutionalOrders.length > 0;

  return (
    <div className="space-y-6">
      <Card className={cn(
        "border-2 bg-gradient-to-br from-card/80 backdrop-blur-sm transition-all duration-300",
        isPositive 
          ? "to-neon-green/10 border-neon-green/40 shadow-neon-bullish" 
          : "to-neon-red/10 border-neon-red/40 shadow-neon-bearish"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-full border-2 transition-all duration-300",
                isPositive 
                  ? "border-neon-green/60 shadow-neon-bullish" 
                  : "border-neon-red/60 shadow-neon-bearish"
              )}>
                <img
                  src="/assets/generated/icp-logo-neon-transparent.dim_200x200.png"
                  alt="ICP Logo"
                  className="w-16 h-16"
                />
              </div>
              <div>
                <CardTitle className={cn(
                  "text-3xl font-bold",
                  isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                )}>
                  ICP (Internet Computer)
                </CardTitle>
                <CardDescription className="text-base font-medium">
                  Análise Detalhada com Inteligência Preditiva - Binance Futures USD-M
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={isPositive ? 'default' : 'destructive'}
              className={cn(
                "text-2xl px-8 py-4 border-2 font-bold",
                isPositive 
                  ? "bg-neon-green/20 text-neon-green border-neon-green/60 shadow-neon-bullish" 
                  : "bg-neon-red/20 text-neon-red border-neon-red/60 shadow-neon-bearish"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-7 h-7 mr-2" />
              ) : (
                <TrendingDown className="w-7 h-7 mr-2" />
              )}
              {icpMarket.priceChangePercent.toFixed(2)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-5 rounded-lg bg-accent/30 border-2 border-neon-cyan/40 shadow-neon-md">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Preço Atual</p>
              <p className="text-4xl font-bold text-neon-cyan neon-text">
                ${parseFloat(icpMarket.lastPrice).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-5 rounded-lg bg-accent/30 border-2 border-neon-blue/40 shadow-neon-md">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Volume 24h</p>
              <p className="text-3xl font-bold text-neon-blue">
                ${(parseFloat(icpMarket.quoteVolume) / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="p-5 rounded-lg bg-neon-green/10 border-2 border-neon-green/40 shadow-neon-bullish">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Máxima 24h</p>
              <p className="text-3xl font-bold text-neon-green">
                ${parseFloat(icpMarket.highPrice).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-5 rounded-lg bg-accent/30 border-2 border-neon-purple/40 shadow-neon-md">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Mínima 24h</p>
              <p className="text-3xl font-bold text-neon-purple">
                ${parseFloat(icpMarket.lowPrice).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <PredictiveConfidencePanel analysis={icpMarket.analysis} symbol="ICPUSDT" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-neon-cyan/30 bg-card/60 shadow-neon-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-neon-cyan animate-pulse-neon" />
                  <CardTitle className="text-xl text-neon-cyan">Análise Técnica Avançada</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-300",
                  icpMarket.analysis.trend === 'bullish'
                    ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish"
                    : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground font-medium">Tendência Atual</span>
                    {icpMarket.analysis.trend === 'bullish' ? (
                      <Badge className="bg-neon-green/20 text-neon-green border-2 border-neon-green/60 font-bold text-base">
                        <TrendingUp className="w-5 h-5 mr-1" />
                        Bullish
                      </Badge>
                    ) : (
                      <Badge className="bg-neon-red/20 text-neon-red border-2 border-neon-red/60 font-bold text-base">
                        <TrendingDown className="w-5 h-5 mr-1" />
                        Bearish
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Análise baseada em SMC, Volume Delta, Price Action e zonas de liquidez
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-accent/30 border-2 border-neon-cyan/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">Força do Sinal</span>
                    <Badge variant="outline" className="text-base border-2 border-neon-cyan/60 text-neon-cyan font-bold">
                      <Zap className="w-5 h-5 mr-1" />
                      {icpMarket.analysis.strength.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4 border-2 border-border">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isPositive 
                          ? "bg-gradient-to-r from-neon-green via-neon-cyan to-neon-blue shadow-neon-bullish" 
                          : "bg-gradient-to-r from-neon-red via-neon-orange to-neon-pink shadow-neon-bearish"
                      )}
                      style={{ width: `${icpMarket.analysis.strength}%` }}
                    />
                  </div>
                </div>

                <div className={cn(
                  "p-5 rounded-lg border-2 transition-all duration-300",
                  isPositive 
                    ? "bg-neon-green/10 border-neon-green/40 shadow-neon-bullish" 
                    : "bg-neon-red/10 border-neon-red/40 shadow-neon-bearish"
                )}>
                  <h4 className="text-sm font-bold mb-2 text-muted-foreground">Predição de Preço (24h)</h4>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-4xl font-bold",
                      isPositive ? "text-neon-green neon-text-bullish" : "text-neon-red neon-text-bearish"
                    )}>
                      ${icpMarket.analysis.prediction.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className={cn(
                      "text-base font-bold",
                      isPositive ? "text-neon-green" : "text-neon-red"
                    )}>
                      (
                      {(
                        ((icpMarket.analysis.prediction - parseFloat(icpMarket.lastPrice)) /
                          parseFloat(icpMarket.lastPrice)) *
                        100
                      ).toFixed(2)}
                      %)
                    </span>
                  </div>
                </div>

                {(hasManipulationZones || hasInstitutionalOrders) && (
                  <div className="space-y-3">
                    {hasManipulationZones && (
                      <div className="p-3 rounded-lg bg-neon-orange/10 border-2 border-neon-orange/40">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src="/assets/generated/manipulation-zone-icon-transparent.dim_48x48.png" 
                            alt="Zona de Manipulação" 
                            className="w-5 h-5"
                          />
                          <span className="text-sm font-bold text-neon-orange">
                            {icpMarket.analysis.manipulationZones.length} Zona(s) Detectada(s)
                          </span>
                        </div>
                      </div>
                    )}
                    {hasInstitutionalOrders && (
                      <div className="p-3 rounded-lg bg-neon-purple/10 border-2 border-neon-purple/40">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src="/assets/generated/institutional-order-icon-transparent.dim_48x48.png" 
                            alt="Ordem Institucional" 
                            className="w-5 h-5"
                          />
                          <span className="text-sm font-bold text-neon-purple">
                            {icpMarket.analysis.institutionalOrders.length} Ordem(ns) Detectada(s)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-neon-cyan/30 bg-card/60 shadow-neon-md">
              <CardHeader>
                <CardTitle className="text-xl text-neon-cyan">Zonas de Suporte e Resistência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-neon-green/10 border-2 border-neon-green/40 shadow-neon-bullish">
                  <h4 className="text-sm font-bold text-neon-green mb-3 flex items-center gap-2 neon-text-bullish">
                    <TrendingUp className="w-5 h-5" />
                    Zonas de Resistência
                  </h4>
                  <div className="space-y-2">
                    {icpMarket.analysis.resistanceZones.map((zone, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded bg-card/60 border-2 border-neon-green/30"
                      >
                        <span className="text-sm text-muted-foreground font-bold">R{idx + 1}</span>
                        <span className="font-mono font-bold text-lg text-neon-green neon-text-bullish">
                          ${zone.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-neon-cyan/10 border-2 border-neon-cyan/40 shadow-neon-md">
                  <h4 className="text-sm font-bold text-neon-cyan mb-3 flex items-center gap-2 neon-text">
                    <TrendingDown className="w-5 h-5" />
                    Zonas de Suporte
                  </h4>
                  <div className="space-y-2">
                    {icpMarket.analysis.supportZones.map((zone, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded bg-card/60 border-2 border-neon-cyan/30"
                      >
                        <span className="text-sm text-muted-foreground font-bold">S{idx + 1}</span>
                        <span className="font-mono font-bold text-lg text-neon-cyan neon-text">
                          ${zone.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-neon-blue/30 bg-card/60 mt-6 shadow-neon-md">
            <CardHeader>
              <CardTitle className="text-xl text-neon-blue">Sobre o Internet Computer (ICP)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-base">
                O Internet Computer (ICP) é uma blockchain de terceira geração que permite a execução de
                contratos inteligentes em velocidade web. Desenvolvido pela DFINITY Foundation, o ICP visa
                estender a funcionalidade da internet pública, permitindo que desenvolvedores criem
                websites, sistemas empresariais e serviços de internet diretamente na blockchain. Com sua
                arquitetura única e capacidade de escala, o ICP representa uma evolução significativa no
                ecossistema blockchain.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
