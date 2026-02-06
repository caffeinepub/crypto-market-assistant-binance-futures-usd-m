import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PWAInstallDialog({ open, onOpenChange }: PWAInstallDialogProps) {
  const { isIOSDevice, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    await promptInstall();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-neon-cyan/30 bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl text-neon-cyan flex items-center gap-2">
            <Download className="w-5 h-5" />
            Instalar Aplicativo
          </DialogTitle>
          <DialogDescription className="text-base">
            {isIOSDevice 
              ? 'Siga as instruções abaixo para instalar no iOS'
              : 'Adicione o app à sua tela inicial para acesso rápido'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isIOSDevice ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                <div className="flex items-start gap-3 mb-4">
                  <Share className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-neon-cyan">
                    Como Instalar no Safari (iOS)
                  </p>
                </div>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                  <li className="pl-2">
                    Toque no ícone de <span className="font-semibold text-foreground">compartilhar</span> <span className="inline-block text-lg">⎋</span> na barra inferior do Safari
                  </li>
                  <li className="pl-2">
                    Role para baixo e selecione <span className="font-semibold text-foreground">"Adicionar à Tela de Início"</span>
                  </li>
                  <li className="pl-2">
                    Toque em <span className="font-semibold text-foreground">"Adicionar"</span> no canto superior direito
                  </li>
                  <li className="pl-2">
                    O app aparecerá na sua tela inicial como um aplicativo nativo
                  </li>
                </ol>
              </div>
              <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/30">
                <p className="text-xs text-neon-green">
                  ✓ Após instalado, o app abrirá em tela cheia sem a interface do Safari
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-neon-orange/10 border border-neon-orange/30">
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para instalar o aplicativo. Ele será adicionado à sua 
                  tela inicial e poderá ser acessado como um app nativo.
                </p>
              </div>
              <Button
                onClick={handleInstall}
                className="w-full bg-neon-orange hover:bg-neon-orange/90 text-primary-foreground shadow-lg shadow-neon-orange/30"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Instalar Agora
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs font-semibold text-foreground mb-2">Benefícios:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Acesso rápido da tela inicial</li>
              <li>• Funciona offline</li>
              <li>• Experiência em tela cheia</li>
              <li>• Atualizações automáticas</li>
            </ul>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4"
        >
          <X className="w-4 h-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
