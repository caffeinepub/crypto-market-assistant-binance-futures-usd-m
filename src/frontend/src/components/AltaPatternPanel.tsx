import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useBinanceMarketData } from "@/hooks/useQueries";
import { buildAltaProfile, detectAltaCandidates } from "@/lib/altaDetector";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BarChart3,
  Flame,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function AltaPatternPanel() {
  const { data: marketData, isLoading } = useBinanceMarketData();
  const [threshold, setThreshold] = useState(8);

  const { profile, candidates, spikesFound } = useMemo(() => {
    if (!marketData || marketData.length === 0) {
      return { profile: null, candidates: [], spikesFound: 0 };
    }
    const p = buildAltaProfile(marketData, threshold);
    const c = detectAltaCandidates(marketData, p, threshold);
    const spikesFound = marketData.filter(
      (a) => a.priceChangePercent >= threshold,
    ).length;
    return { profile: p, candidates: c, spikesFound };
  }, [marketData, threshold]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((_i) => (
          <Skeleton key={_i} className="h-28" />
        ))}
      </div>
    );
  }

  const topCandidates = candidates.slice(0, 15);

  return (
    <div className="space-y-4">
      {/* Header + Config */}
      <Card className="border-2 border-neon-orange/40 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-neon-orange animate-pulse" />
            <CardTitle className="text-neon-orange">
              Detector de Potencial de Alta
            </CardTitle>
          </div>
          <CardDescription>
            Identifica ativos com padrão similar aos que explodiram
            recentemente. Score &gt; 0.7 = alto potencial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Threshold slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Limiar de alta significativa:
              </span>
              <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/60">
                +{threshold}% em 24h
              </Badge>
            </div>
            <Slider
              data-ocid="alta.threshold.input"
              min={3}
              max={20}
              step={1}
              value={[threshold]}
              onValueChange={([v]) => setThreshold(v)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Profile stats */}
          {profile && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-accent/30 border border-neon-orange/20 text-center">
                <div className="text-neon-orange font-bold">{spikesFound}</div>
                <div className="text-muted-foreground">
                  Explosões detectadas
                </div>
              </div>
              <div className="p-2 rounded bg-accent/30 border border-neon-cyan/20 text-center">
                <div className="text-neon-cyan font-bold">
                  {profile.avgVolumeRatio.toFixed(1)}x
                </div>
                <div className="text-muted-foreground">
                  Vol. médio das altas
                </div>
              </div>
              <div className="p-2 rounded bg-accent/30 border border-neon-green/20 text-center">
                <div className="text-neon-green font-bold">
                  {topCandidates.length}
                </div>
                <div className="text-muted-foreground">Candidatos</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidates list */}
      {topCandidates.length === 0 ? (
        <Alert className="border-neon-orange/30 bg-neon-orange/5">
          <AlertCircle className="h-4 w-4 text-neon-orange" />
          <AlertDescription className="text-muted-foreground">
            Nenhum candidato encontrado com o limiar atual. Tente reduzir o
            threshold.
          </AlertDescription>
        </Alert>
      ) : (
        <ScrollArea className="h-[520px] pr-2">
          <div className="space-y-3">
            {topCandidates.map((c, idx) => {
              const scorePercent = Math.round(c.score * 100);
              const isHot = c.score >= 0.7;
              const isMedium = c.score >= 0.6 && c.score < 0.7;

              return (
                <Card
                  key={c.symbol}
                  data-ocid={`alta.candidate.card.${idx + 1}`}
                  className={cn(
                    "border-2 bg-gradient-to-br from-card/80 backdrop-blur-sm transition-all duration-200",
                    isHot
                      ? "border-neon-orange/60 to-neon-orange/10 shadow-[0_0_12px_rgba(255,120,0,0.2)]"
                      : isMedium
                        ? "border-neon-yellow/40 to-neon-yellow/5"
                        : "border-border/40 to-transparent",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {isHot && (
                          <Flame className="w-4 h-4 text-neon-orange flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-lg text-foreground">
                            {c.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            $
                            {Number.parseFloat(c.lastPrice).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                              },
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {/* Score badge */}
                        <Badge
                          className={cn(
                            "text-sm font-bold px-3 py-1 border-2",
                            isHot
                              ? "bg-neon-orange/20 text-neon-orange border-neon-orange/60"
                              : isMedium
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                                : "bg-muted/20 text-muted-foreground border-muted/40",
                          )}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Score {scorePercent}%
                        </Badge>

                        {/* 24h change */}
                        <Badge
                          className={cn(
                            "text-xs",
                            c.priceChangePercent >= 0
                              ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                              : "bg-neon-red/10 text-neon-red border border-neon-red/30",
                          )}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {c.priceChangePercent >= 0 ? "+" : ""}
                          {c.priceChangePercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Similaridade com perfil de alta</span>
                        <span>{scorePercent}%</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isHot
                              ? "bg-neon-orange"
                              : isMedium
                                ? "bg-yellow-400"
                                : "bg-muted-foreground",
                          )}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics mini-grid */}
                    <div className="grid grid-cols-3 gap-1.5 mb-3 text-xs">
                      <div className="p-1.5 rounded bg-accent/20 border border-border/30 text-center">
                        <BarChart3 className="w-3 h-3 mx-auto mb-0.5 text-neon-cyan" />
                        <div className="text-neon-cyan font-medium">
                          {c.metrics.volumeRatio.toFixed(1)}x
                        </div>
                        <div className="text-muted-foreground">Volume</div>
                      </div>
                      <div className="p-1.5 rounded bg-accent/20 border border-border/30 text-center">
                        <Zap className="w-3 h-3 mx-auto mb-0.5 text-neon-purple" />
                        <div className="text-neon-purple font-medium">
                          {(c.metrics.volatility * 100).toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground">Volatil.</div>
                      </div>
                      <div className="p-1.5 rounded bg-accent/20 border border-border/30 text-center">
                        <TrendingUp className="w-3 h-3 mx-auto mb-0.5 text-neon-green" />
                        <div className="text-neon-green font-medium">
                          {c.metrics.distFromOpen >= 0 ? "+" : ""}
                          {(c.metrics.distFromOpen * 100).toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground">vs Abertura</div>
                      </div>
                    </div>

                    {/* Reasons */}
                    <div className="flex flex-wrap gap-1.5">
                      {c.reasons.map((r) => (
                        <Badge
                          key={r}
                          variant="outline"
                          className="text-xs border-neon-orange/30 text-neon-orange/80"
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
