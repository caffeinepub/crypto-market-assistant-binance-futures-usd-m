import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, TrendingUp, Zap, Target, Award } from 'lucide-react';
import { learningEngine, type AssetLearningStats } from '@/lib/learningEngine';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AIPerformancePanelProps {
  symbol?: string;
  compact?: boolean;
}

export default function AIPerformancePanel({ symbol, compact = false }: AIPerformancePanelProps) {
  const [stats, setStats] = useState<AssetLearningStats | null>(null);
  const [allStats, setAllStats] = useState<AssetLearningStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        await learningEngine.initialize();
        if (symbol) {
          const assetStats = await learningEngine.getAssetStats(symbol);
          setStats(assetStats);
        } else {
          const all = await learningEngine.getAllAssetStats();
          setAllStats(all.sort((a, b) => b.learningLevel - a.learningLevel).slice(0, 10));
        }
      } catch (error) {
        console.error('Error loading learning stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [symbol]);

  const getLearningLevelColor = (level: number): string => {
    if (level >= 0.7) return 'from-neon-green via-neon-cyan to-neon-purple';
    if (level >= 0.4) return 'from-neon-cyan via-neon-blue to-neon-purple';
    return 'from-neon-purple via-neon-pink to-neon-orange';
  };

  const getLearningLevelLabel = (level: number): string => {
    if (level >= 0.7) return 'Avançado';
    if (level >= 0.4) return 'Intermediário';
    return 'Iniciante';
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-border bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (compact && stats) {
    return (
      <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 border-2 border-neon-purple/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-neon-purple" />
            <span className="text-sm font-semibold text-neon-purple">Nível de Aprendizado IA</span>
          </div>
          <Badge className="bg-neon-purple/20 text-neon-purple border-2 border-neon-purple/60 font-bold">
            {getLearningLevelLabel(stats.learningLevel)}
          </Badge>
        </div>
        <div className="relative w-full h-3 bg-muted rounded-full border border-border overflow-hidden">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
              `bg-gradient-to-r ${getLearningLevelColor(stats.learningLevel)}`
            )}
            style={{ width: `${stats.learningLevel * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-neon-green" />
            <span className="text-muted-foreground">Precisão:</span>
            <span className="font-bold text-neon-green">{Math.round(stats.accuracyRate * 100)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-neon-cyan" />
            <span className="text-muted-foreground">Predições:</span>
            <span className="font-bold text-neon-cyan">{stats.totalPredictions}</span>
          </div>
        </div>
      </div>
    );
  }

  if (symbol && stats) {
    return (
      <Card className="border-2 border-neon-purple/40 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 backdrop-blur-sm shadow-neon-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Brain className="w-7 h-7 text-neon-purple animate-pulse-neon" />
            <div>
              <CardTitle className="text-xl text-neon-purple neon-text">Análise de Performance da IA</CardTitle>
              <CardDescription className="text-sm mt-1">
                Aprendizado contínuo para {symbol}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Nível de Aprendizado</span>
              <Badge className={cn(
                'text-base px-4 py-2 border-2 font-bold',
                stats.learningLevel >= 0.7 
                  ? 'bg-neon-green/20 text-neon-green border-neon-green/60'
                  : stats.learningLevel >= 0.4
                  ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60'
                  : 'bg-neon-purple/20 text-neon-purple border-neon-purple/60'
              )}>
                <Award className="w-5 h-5 mr-2" />
                {getLearningLevelLabel(stats.learningLevel)}
              </Badge>
            </div>
            <div className="relative w-full h-8 bg-muted rounded-lg border-2 border-border overflow-hidden">
              <div
                className={cn(
                  'absolute inset-0 rounded-lg transition-all duration-700',
                  `bg-gradient-to-r ${getLearningLevelColor(stats.learningLevel)}`
                )}
                style={{ width: `${stats.learningLevel * 100}%` }}
              />
              <div
                className="absolute inset-0 rounded-lg animate-pulse"
                style={{
                  width: `${stats.learningLevel * 100}%`,
                  background: `linear-gradient(90deg, transparent, oklch(var(--neon-cyan) / 0.4), transparent)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-foreground drop-shadow-lg">
                  {Math.round(stats.learningLevel * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-neon-green/10 border-2 border-neon-green/40">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-neon-green" />
                <span className="text-xs text-muted-foreground font-medium">Taxa de Acertos</span>
              </div>
              <p className="text-2xl font-bold text-neon-green">
                {Math.round(stats.accuracyRate * 100)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.correctPredictions} de {stats.totalPredictions} predições
              </p>
            </div>

            <div className="p-4 rounded-lg bg-neon-cyan/10 border-2 border-neon-cyan/40">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-neon-cyan" />
                <span className="text-xs text-muted-foreground font-medium">Confiança Média</span>
              </div>
              <p className="text-2xl font-bold text-neon-cyan">
                {Math.round(stats.averageConfidence * 100)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado em histórico
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-neon-purple flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Pesos Otimizados dos Indicadores
            </h4>
            <div className="space-y-2">
              {Object.entries(stats.indicatorWeights).map(([indicator, weight]) => (
                <div key={indicator} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium capitalize">
                      {indicator === 'smc' ? 'SMC' : indicator === 'volumeDelta' ? 'Volume Delta' : indicator === 'fvg' ? 'FVG' : 'Liquidez'}
                    </span>
                    <span className="font-bold text-neon-cyan">{Math.round(weight * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 border border-border">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-500"
                      style={{ width: `${weight * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-neon-purple">Aprendizado Contínuo:</span> A IA ajusta automaticamente 
              os pesos dos indicadores técnicos baseado no histórico de acertos. Quanto maior o nível de aprendizado, 
              mais precisa a IA se torna nas predições para este ativo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show top learning assets
  return (
    <Card className="border-2 border-neon-purple/40 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 backdrop-blur-sm shadow-neon-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7 text-neon-purple animate-pulse-neon" />
          <div>
            <CardTitle className="text-xl text-neon-purple neon-text">Performance da IA por Ativo</CardTitle>
            <CardDescription className="text-sm mt-1">
              Top 10 ativos com maior nível de aprendizado
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {allStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Brain className="w-16 h-16 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground text-center">
              Nenhum dado de aprendizado disponível
            </p>
            <p className="text-sm text-muted-foreground/70 text-center max-w-md">
              A IA começará a aprender conforme predições forem sendo feitas e validadas ao longo do tempo.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {allStats.map((assetStats, index) => (
                <Card
                  key={assetStats.symbol}
                  className={cn(
                    'border-2 transition-all duration-300 hover:scale-[1.02]',
                    assetStats.learningLevel >= 0.7
                      ? 'border-neon-green/40 bg-neon-green/5'
                      : assetStats.learningLevel >= 0.4
                      ? 'border-neon-cyan/40 bg-neon-cyan/5'
                      : 'border-neon-purple/40 bg-neon-purple/5'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold',
                          assetStats.learningLevel >= 0.7
                            ? 'bg-neon-green/20 border-neon-green/60 text-neon-green'
                            : assetStats.learningLevel >= 0.4
                            ? 'bg-neon-cyan/20 border-neon-cyan/60 text-neon-cyan'
                            : 'bg-neon-purple/20 border-neon-purple/60 text-neon-purple'
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{assetStats.symbol}</h3>
                          <p className="text-xs text-muted-foreground">
                            {assetStats.totalPredictions} predições
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(
                        'text-sm px-3 py-1 border-2 font-bold',
                        assetStats.learningLevel >= 0.7
                          ? 'bg-neon-green/20 text-neon-green border-neon-green/60'
                          : assetStats.learningLevel >= 0.4
                          ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60'
                          : 'bg-neon-purple/20 text-neon-purple border-neon-purple/60'
                      )}>
                        {getLearningLevelLabel(assetStats.learningLevel)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="relative w-full h-2 bg-muted rounded-full border border-border overflow-hidden">
                        <div
                          className={cn(
                            'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
                            `bg-gradient-to-r ${getLearningLevelColor(assetStats.learningLevel)}`
                          )}
                          style={{ width: `${assetStats.learningLevel * 100}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded bg-accent/30">
                          <span className="text-muted-foreground">Precisão:</span>
                          <span className="font-bold text-neon-green">
                            {Math.round(assetStats.accuracyRate * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-accent/30">
                          <span className="text-muted-foreground">Confiança:</span>
                          <span className="font-bold text-neon-cyan">
                            {Math.round(assetStats.averageConfidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
