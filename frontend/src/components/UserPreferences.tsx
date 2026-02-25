import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Star, Palette, Volume2, VolumeX, Check, Brain, RotateCcw } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useBinanceMarketData } from '@/hooks/useQueries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PWAInstallStatus from './PWAInstallStatus';
import PWADiagnosticsView from './PWADiagnosticsView';
import ResetFromScratchDialog from './ResetFromScratchDialog';

export default function UserPreferences() {
  const { theme, setTheme } = useTheme();
  const { data: marketData } = useBinanceMarketData();
  const [favouriteAssets, setFavouriteAssets] = useState<string[]>(() => {
    const stored = localStorage.getItem('favourite-assets');
    return stored ? JSON.parse(stored) : [];
  });
  const [enableAlerts, setEnableAlerts] = useState(() => {
    const stored = localStorage.getItem('enable-alerts');
    return stored !== 'false';
  });
  const [prioritizeFavouritesForLearning, setPrioritizeFavouritesForLearning] = useState(() => {
    const stored = localStorage.getItem('prioritize-favourites-learning');
    return stored === 'true';
  });
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    localStorage.setItem('favourite-assets', JSON.stringify(favouriteAssets));
  }, [favouriteAssets]);

  useEffect(() => {
    localStorage.setItem('enable-alerts', String(enableAlerts));
  }, [enableAlerts]);

  useEffect(() => {
    localStorage.setItem('prioritize-favourites-learning', String(prioritizeFavouritesForLearning));
  }, [prioritizeFavouritesForLearning]);

  const toggleFavourite = (symbol: string) => {
    setFavouriteAssets((prev) => {
      if (prev.includes(symbol)) {
        toast.success(`${symbol} removido dos favoritos`);
        return prev.filter((s) => s !== symbol);
      } else {
        toast.success(`${symbol} adicionado aos favoritos`);
        return [...prev, symbol];
      }
    });
  };

  const handleThemeChange = (newTheme: 'darkNeon' | 'cyberGlow') => {
    setTheme(newTheme);
    toast.success(`Tema alterado para ${newTheme === 'darkNeon' ? 'Dark Neon' : 'Cyber Glow'}`);
  };

  const handleAlertsToggle = (checked: boolean) => {
    setEnableAlerts(checked);
    toast.success(checked ? 'Alertas ativados' : 'Alertas desativados');
  };

  const handleLearningPriorityToggle = (checked: boolean) => {
    setPrioritizeFavouritesForLearning(checked);
    toast.success(
      checked 
        ? 'I.A. priorizará seus favoritos para aprendizado' 
        : 'Priorização de favoritos desativada'
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-neon-purple/30 bg-card/60 backdrop-blur-sm shadow-neon-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="w-7 h-7 text-neon-purple animate-pulse-neon" />
            <div>
              <CardTitle className="text-2xl text-neon-purple neon-text">Preferências do Usuário</CardTitle>
              <CardDescription className="text-base mt-1">
                Personalize sua experiência no aplicativo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-neon-cyan" />
              <h3 className="text-lg font-semibold text-neon-cyan">Tema Visual</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                className={cn(
                  'border-2 cursor-pointer transition-all duration-300 hover:scale-105',
                  theme === 'darkNeon'
                    ? 'border-neon-pink/60 bg-neon-pink/10 shadow-neon-md'
                    : 'border-border/40 bg-card/40 hover:border-neon-pink/40'
                )}
                onClick={() => handleThemeChange('darkNeon')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-neon-pink">Dark Neon</h4>
                    {theme === 'darkNeon' && (
                      <Check className="w-6 h-6 text-neon-pink" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tons roxo/rosa neon com alta intensidade e brilho vibrante
                  </p>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-neon-purple border-2 border-neon-purple/60" />
                    <div className="w-8 h-8 rounded-full bg-neon-pink border-2 border-neon-pink/60" />
                    <div className="w-8 h-8 rounded-full bg-neon-orange border-2 border-neon-orange/60" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'border-2 cursor-pointer transition-all duration-300 hover:scale-105',
                  theme === 'cyberGlow'
                    ? 'border-neon-cyan/60 bg-neon-cyan/10 shadow-neon-md'
                    : 'border-border/40 bg-card/40 hover:border-neon-cyan/40'
                )}
                onClick={() => handleThemeChange('cyberGlow')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-neon-cyan">Cyber Glow</h4>
                    {theme === 'cyberGlow' && (
                      <Check className="w-6 h-6 text-neon-cyan" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tons azul/teal com animações suaves e contraste ajustado
                  </p>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-neon-cyan border-2 border-neon-cyan/60" />
                    <div className="w-8 h-8 rounded-full bg-neon-blue border-2 border-neon-blue/60" />
                    <div className="w-8 h-8 rounded-full bg-chart-2 border-2 border-chart-2/60" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Alerts Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {enableAlerts ? (
                <Volume2 className="w-5 h-5 text-neon-green" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <h3 className="text-lg font-semibold text-neon-cyan">Alertas Dinâmicos</h3>
            </div>
            <Card className="border-2 border-neon-green/30 bg-neon-green/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="alerts-toggle" className="text-base font-semibold">
                      Ativar Alertas Visuais e Sonoros
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações para novas detecções radar e recomendações de alta confiança
                    </p>
                  </div>
                  <Switch
                    id="alerts-toggle"
                    checked={enableAlerts}
                    onCheckedChange={handleAlertsToggle}
                    className="data-[state=checked]:bg-neon-green"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Favourite Assets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-neon-orange fill-neon-orange" />
              <h3 className="text-lg font-semibold text-neon-cyan">Ativos Favoritos</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecione seus ativos favoritos para receber alertas prioritários
            </p>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {marketData?.map((market) => {
                  const isFavourite = favouriteAssets.includes(market.symbol);
                  return (
                    <Button
                      key={market.symbol}
                      variant="outline"
                      onClick={() => toggleFavourite(market.symbol)}
                      className={cn(
                        'h-auto py-3 px-4 flex flex-col items-center gap-2 transition-all duration-300',
                        isFavourite
                          ? 'border-2 border-neon-orange/60 bg-neon-orange/10 hover:bg-neon-orange/20'
                          : 'border-border/40 hover:border-neon-orange/40'
                      )}
                    >
                      <Star
                        className={cn(
                          'w-5 h-5',
                          isFavourite ? 'text-neon-orange fill-neon-orange' : 'text-muted-foreground'
                        )}
                      />
                      <span className={cn(
                        'text-sm font-semibold',
                        isFavourite ? 'text-neon-orange' : 'text-foreground'
                      )}>
                        {market.symbol}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
            {favouriteAssets.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-neon-orange/10 border border-neon-orange/30">
                <span className="text-sm font-semibold text-neon-orange">Favoritos selecionados:</span>
                {favouriteAssets.map((symbol) => (
                  <Badge
                    key={symbol}
                    className="bg-neon-orange/20 text-neon-orange border border-neon-orange/60"
                  >
                    {symbol}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* AI Learning Priority */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-neon-purple" />
              <h3 className="text-lg font-semibold text-neon-cyan">Aprendizado I.A.</h3>
            </div>
            <Card className="border-2 border-neon-purple/30 bg-neon-purple/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="learning-priority-toggle" className="text-base font-semibold">
                      Priorizar Favoritos para Aprendizado
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      A I.A. dará preferência aos seus ativos favoritos durante o processo de aprendizado
                    </p>
                  </div>
                  <Switch
                    id="learning-priority-toggle"
                    checked={prioritizeFavouritesForLearning}
                    onCheckedChange={handleLearningPriorityToggle}
                    className="data-[state=checked]:bg-neon-purple"
                  />
                </div>
                {prioritizeFavouritesForLearning && favouriteAssets.length === 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-neon-orange/10 border border-neon-orange/30">
                    <p className="text-sm text-neon-orange">
                      ⚠️ Selecione ativos favoritos acima para ativar a priorização
                    </p>
                  </div>
                )}
                {prioritizeFavouritesForLearning && favouriteAssets.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
                    <p className="text-sm text-neon-purple">
                      ✓ I.A. priorizando {favouriteAssets.length} ativo{favouriteAssets.length > 1 ? 's' : ''} favorito{favouriteAssets.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reset from Scratch */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold text-neon-cyan">Reset & Reload</h3>
            </div>
            <Card className="border-2 border-destructive/30 bg-destructive/5">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-foreground">
                      Reload from Scratch
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Clear all local data and start fresh. This will delete AI learning history, preferences, and cached data.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowResetDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reload from Scratch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* PWA Install Status */}
      <PWAInstallStatus />

      {/* PWA Diagnostics */}
      <PWADiagnosticsView />

      <Card className="border-2 border-neon-cyan/30 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-neon-cyan">Sobre as Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Personalize sua experiência no <span className="text-neon-cyan font-semibold">Crypto Market Assistant</span> ajustando as configurações acima.
          </p>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Recursos Disponíveis:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="text-neon-pink">Dark Neon</span>: Tema original com tons roxo/rosa vibrantes</li>
              <li><span className="text-neon-cyan">Cyber Glow</span>: Novo tema com tons azul/teal suaves</li>
              <li><span className="text-neon-green">Alertas Dinâmicos</span>: Notificações visuais e sonoras para eventos importantes</li>
              <li><span className="text-neon-orange">Ativos Favoritos</span>: Alertas prioritários para seus ativos preferidos</li>
              <li><span className="text-neon-purple">Aprendizado I.A.</span>: Priorize favoritos para aprendizado mais focado</li>
              <li><span className="text-destructive">Reload from Scratch</span>: Clear all data and start fresh</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-4">
            Todas as preferências são salvas localmente no seu dispositivo e persistem entre sessões.
          </p>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <ResetFromScratchDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
      />
    </div>
  );
}
