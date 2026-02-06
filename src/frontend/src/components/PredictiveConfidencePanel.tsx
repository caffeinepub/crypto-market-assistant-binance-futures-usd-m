import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TechnicalAnalysis } from '@/hooks/useQueries';

interface PredictiveConfidencePanelProps {
  analysis: TechnicalAnalysis;
  symbol: string;
  compact?: boolean;
}

export default function PredictiveConfidencePanel({ analysis, symbol, compact = false }: PredictiveConfidencePanelProps) {
  const confidencePercent = Math.round(analysis.confidence * 100);
  const isHighConfidence = analysis.confidence >= 0.7;
  const isMediumConfidence = analysis.confidence >= 0.4 && analysis.confidence < 0.7;
  
  // Calculate gradient position (0-100%)
  const gradientPosition = confidencePercent;
  
  // Determine color based on confidence level
  const getConfidenceColor = () => {
    if (isHighConfidence) return 'from-neon-green via-neon-cyan to-neon-purple';
    if (isMediumConfidence) return 'from-neon-cyan via-neon-blue to-neon-purple';
    return 'from-neon-purple via-neon-pink to-neon-red';
  };

  const getConfidenceLabel = () => {
    if (isHighConfidence) return 'Alta Confiança';
    if (isMediumConfidence) return 'Confiança Média';
    return 'Baixa Confiança';
  };

  const getConfidenceBadgeClass = () => {
    if (isHighConfidence) return 'bg-neon-green/20 text-neon-green border-neon-green/60';
    if (isMediumConfidence) return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60';
    return 'bg-neon-purple/20 text-neon-purple border-neon-purple/60';
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Confiança Preditiva</span>
          <Badge className={cn('text-xs px-2 py-1 border-2 font-bold', getConfidenceBadgeClass())}>
            <Zap className="w-3 h-3 mr-1" />
            {confidencePercent}%
          </Badge>
        </div>
        <div className="relative w-full h-2 bg-muted rounded-full border border-border overflow-hidden">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
              `bg-gradient-to-r ${getConfidenceColor()}`
            )}
            style={{ width: `${gradientPosition}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full animate-pulse"
            style={{
              width: `${gradientPosition}%`,
              background: `linear-gradient(90deg, transparent, oklch(var(--neon-cyan) / 0.3), transparent)`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      'border-2 transition-all duration-300',
      isHighConfidence && 'border-neon-green/40 bg-neon-green/5 shadow-neon-bullish',
      isMediumConfidence && 'border-neon-cyan/40 bg-neon-cyan/5 shadow-neon-md',
      !isHighConfidence && !isMediumConfidence && 'border-neon-purple/40 bg-neon-purple/5'
    )}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isHighConfidence ? (
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green" />
            ) : (
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-neon-cyan" />
            )}
            <h4 className="text-base sm:text-lg font-bold text-foreground">Confiança Preditiva</h4>
          </div>
          <Badge className={cn('text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 border-2 font-bold', getConfidenceBadgeClass())}>
            {confidencePercent}%
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="relative w-full h-8 sm:h-10 bg-muted rounded-lg border-2 border-border overflow-hidden">
            <div
              className={cn(
                'absolute inset-0 rounded-lg transition-all duration-700',
                `bg-gradient-to-r ${getConfidenceColor()}`
              )}
              style={{ width: `${gradientPosition}%` }}
            />
            <div
              className="absolute inset-0 rounded-lg animate-pulse"
              style={{
                width: `${gradientPosition}%`,
                background: `linear-gradient(90deg, transparent, oklch(var(--neon-cyan) / 0.4), transparent)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-foreground drop-shadow-lg">
                {getConfidenceLabel()}
              </span>
            </div>
          </div>

          {analysis.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {analysis.tags.slice(0, 4).map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            Análise baseada em SMC, Volume Delta, Liquidez e Fair Value Gaps. 
            {isHighConfidence && ' Forte sinal de confiabilidade detectado.'}
            {isMediumConfidence && ' Sinal moderado, monitorar evolução.'}
            {!isHighConfidence && !isMediumConfidence && ' Sinal fraco, aguardar confirmação.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
