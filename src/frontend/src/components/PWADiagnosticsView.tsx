import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Smartphone, FileCode, Image, Wifi } from 'lucide-react';
import { usePWADiagnostics } from '@/hooks/usePWADiagnostics';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function PWADiagnosticsView() {
  const diagnostics = usePWADiagnostics();

  const getDisplayModeColor = (mode: string) => {
    if (mode.includes('standalone') || mode === 'fullscreen') {
      return 'bg-neon-green/20 text-neon-green border-neon-green/60';
    }
    if (mode === 'minimal-ui') {
      return 'bg-neon-orange/20 text-neon-orange border-neon-orange/60';
    }
    return 'bg-muted text-muted-foreground border-border';
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-neon-green" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-destructive" />;
    return <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />;
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!diagnostics.isReady) {
    return (
      <Card className="border-2 border-neon-cyan/30 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Executando diagnósticos PWA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-neon-cyan/30 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-neon-cyan" />
            <div>
              <CardTitle className="text-xl text-neon-cyan">Diagnóstico PWA</CardTitle>
              <CardDescription className="mt-1">
                Informações técnicas sobre instalabilidade e modo standalone
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            className="border-neon-cyan/40 hover:bg-neon-cyan/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Mode */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-neon-purple" />
            <h3 className="text-sm font-semibold text-foreground">Modo de Exibição</h3>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getDisplayModeColor(diagnostics.displayMode)}>
              {diagnostics.displayMode}
            </Badge>
            {diagnostics.displayMode === 'browser' && (
              <span className="text-xs text-muted-foreground">
                App está rodando no navegador (não instalado)
              </span>
            )}
            {diagnostics.displayMode.includes('standalone') && (
              <span className="text-xs text-neon-green">
                ✓ App está em modo standalone (instalado corretamente)
              </span>
            )}
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Install Prompt Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-neon-orange" />
            <h3 className="text-sm font-semibold text-foreground">Evento de Instalação</h3>
          </div>
          <div className="flex items-center gap-3">
            {diagnostics.hasBeforeInstallPrompt ? (
              <>
                <CheckCircle className="w-5 h-5 text-neon-green" />
                <span className="text-sm text-neon-green">
                  beforeinstallprompt recebido - app é instalável
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="text-sm text-muted-foreground">
                  beforeinstallprompt não foi disparado
                </span>
              </>
            )}
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Service Worker Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-neon-blue" />
            <h3 className="text-sm font-semibold text-foreground">Service Worker</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {diagnostics.hasServiceWorker ? (
                <CheckCircle className="w-5 h-5 text-neon-green" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <span className="text-sm text-muted-foreground">
                Suporte: {diagnostics.hasServiceWorker ? 'Sim' : 'Não'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  diagnostics.serviceWorkerState === 'active'
                    ? 'bg-neon-green/20 text-neon-green border-neon-green/60'
                    : 'bg-muted text-muted-foreground border-border'
                }
              >
                {diagnostics.serviceWorkerState}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Estado atual do Service Worker
              </span>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Manifest Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-neon-pink" />
            <h3 className="text-sm font-semibold text-foreground">Manifest</h3>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(diagnostics.manifestFetchStatus)}
            <span className="text-sm text-muted-foreground">
              {diagnostics.manifestFetchStatus === 'success' && 'Manifest carregado com sucesso'}
              {diagnostics.manifestFetchStatus === 'error' && `Erro: ${diagnostics.manifestError}`}
              {diagnostics.manifestFetchStatus === 'pending' && 'Verificando...'}
            </span>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Icon Checks */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-sm font-semibold text-foreground">Ícones Críticos</h3>
          </div>
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {diagnostics.iconChecks.map((check) => (
                <div key={check.url} className="flex items-center gap-3 text-xs">
                  {getStatusIcon(check.status)}
                  <span className="text-muted-foreground flex-1 truncate">
                    {check.url}
                  </span>
                  {check.httpStatus && (
                    <Badge variant="outline" className="text-xs">
                      {check.httpStatus}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Issues Section */}
        {diagnostics.issues.length > 0 && (
          <>
            <Separator className="bg-border/50" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h3 className="text-sm font-semibold text-destructive">
                  Problemas Detectados ({diagnostics.issues.length})
                </h3>
              </div>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {diagnostics.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-destructive/10 border border-destructive/30"
                    >
                      <p className="text-xs text-destructive">{issue}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Success Message */}
        {diagnostics.issues.length === 0 && diagnostics.displayMode.includes('standalone') && (
          <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-neon-green">
                  ✓ PWA Instalado e Funcionando Corretamente
                </p>
                <p className="text-xs text-muted-foreground">
                  O app está rodando em modo standalone sem problemas detectados.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Nota:</strong> Se o app não está instalando corretamente no Android, verifique se:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside ml-2">
            <li>Você está acessando via HTTPS (não HTTP)</li>
            <li>O Service Worker está ativo</li>
            <li>Todos os ícones estão carregando (status 200)</li>
            <li>O manifest está acessível sem erros</li>
            <li>O evento beforeinstallprompt foi disparado</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
