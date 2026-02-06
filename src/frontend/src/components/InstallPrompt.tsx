import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import PWAInstallDialog from './PWAInstallDialog';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, isIOSDevice, isDismissed, dismissPrompt } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Show proactive prompt after 3 seconds if installable and not dismissed
    if (isInstallable && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isDismissed]);

  const handleDismiss = () => {
    dismissPrompt();
    setShowPrompt(false);
  };

  const handleOpenDialog = () => {
    setShowPrompt(false);
    setShowDialog(true);
  };

  if (!showPrompt) {
    return <PWAInstallDialog open={showDialog} onOpenChange={setShowDialog} />;
  }

  return (
    <>
      <div className="fixed top-16 left-0 right-0 z-50 px-3 sm:px-4 animate-in slide-in-from-top duration-500">
        <Card className="max-w-md mx-auto bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/20">
          <CardContent className="p-4 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-start gap-3 pr-8">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-sm text-foreground">
                  Instalar Aplicativo
                </h3>
                
                {isIOSDevice ? (
                  <p className="text-xs text-muted-foreground">
                    Adicione à tela inicial para acesso rápido e experiência completa offline.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Instale o app na tela inicial para acesso rápido e experiência completa offline.
                  </p>
                )}
                
                <Button
                  onClick={handleOpenDialog}
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isIOSDevice ? 'Ver Instruções' : 'Instalar Agora'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PWAInstallDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}
