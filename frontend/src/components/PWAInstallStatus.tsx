import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, Check, Download, Info, Share } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallStatus() {
  const { isInstallable, isInstalled, isIOSDevice, isNotSupported, promptInstall, displayMode } = usePWAInstall();

  return (
    <Card className="border-2 border-neon-cyan/30 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Smartphone className="w-6 h-6 text-neon-cyan" />
          <div>
            <CardTitle className="text-xl text-neon-cyan">Status do Aplicativo PWA</CardTitle>
            <CardDescription className="mt-1">
              Informações sobre instalação e modo standalone
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-muted-foreground">Status atual:</span>
          {isInstalled && (
            <Badge className="bg-neon-green/20 text-neon-green border border-neon-green/60">
              <Check className="w-3 h-3 mr-1" />
              Instalado (Standalone)
            </Badge>
          )}
          {isInstallable && !isInstalled && (
            <Badge className="bg-neon-orange/20 text-neon-orange border border-neon-orange/60">
              <Download className="w-3 h-3 mr-1" />
              Pronto para Instalar
            </Badge>
          )}
          {isNotSupported && (
            <Badge className="bg-muted text-muted-foreground border border-border">
              <Info className="w-3 h-3 mr-1" />
              Não Suportado
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            Modo: {displayMode}
          </Badge>
        </div>

        {/* Installed State */}
        {isInstalled && (
          <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-neon-green">
                  Aplicativo Instalado com Sucesso
                </p>
                <p className="text-xs text-muted-foreground">
                  O app está rodando em modo <strong>{displayMode}</strong> (sem interface do navegador). 
                  Você pode acessá-lo diretamente da tela inicial do seu dispositivo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Installable State - Android/Chrome */}
        {isInstallable && !isInstalled && !isIOSDevice && (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-neon-orange/10 border border-neon-orange/30">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-neon-orange flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neon-orange">
                    Pronto para Instalar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Seu navegador suporta instalação PWA. Clique no botão abaixo ou use o 
                    ícone de instalação no cabeçalho para adicionar o app à tela inicial.
                  </p>
                  <p className="text-xs text-neon-orange font-semibold">
                    ✓ Após instalado, o app abrirá em modo standalone (tela cheia, sem barra do navegador)
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={promptInstall}
              className="w-full bg-neon-orange hover:bg-neon-orange/90 text-primary-foreground shadow-lg shadow-neon-orange/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar Aplicativo
            </Button>
          </div>
        )}

        {/* Installable State - iOS */}
        {isInstallable && !isInstalled && isIOSDevice && (
          <div className="p-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <div className="flex items-start gap-3">
              <Share className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-neon-cyan">
                  Como Instalar no iOS/Safari
                </p>
                <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Toque no ícone de compartilhar <span className="inline-block text-base">⎋</span> na barra inferior</li>
                  <li>Role para baixo e toque em <span className="font-semibold text-foreground">"Adicionar à Tela de Início"</span></li>
                  <li>Toque em <span className="font-semibold text-foreground">"Adicionar"</span> para confirmar</li>
                  <li>O app aparecerá na sua tela inicial como um aplicativo nativo</li>
                </ol>
                <p className="text-xs text-neon-cyan font-semibold mt-2">
                  ✓ Após instalado, o app abrirá em tela cheia sem a interface do Safari
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Not Supported State */}
        {isNotSupported && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Instalação Não Disponível
                </p>
                <p className="text-xs text-muted-foreground">
                  Seu navegador atual não suporta instalação PWA ou o app já foi instalado 
                  anteriormente. Você ainda pode usar o app normalmente através do navegador.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm font-semibold text-foreground mb-3">
            Benefícios do App Instalado:
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-neon-green">✓</span>
              <span>Acesso rápido direto da tela inicial</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-green">✓</span>
              <span>Funciona offline após primeira visita</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-green">✓</span>
              <span>Experiência em tela cheia sem interface do navegador</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-green">✓</span>
              <span>Atualizações automáticas em segundo plano</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-green">✓</span>
              <span>Desempenho otimizado e menor consumo de dados</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
