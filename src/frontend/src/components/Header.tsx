import { useState } from 'react';
import { TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import PWAInstallDialog from './PWAInstallDialog';

export default function Header() {
  const { isInstallable, isInstalled, hasReceivedInstallPrompt } = usePWAInstall();
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  // Show install button if installable and not installed
  // Also show if we received the prompt but user hasn't installed yet
  const showInstallButton = (isInstallable || hasReceivedInstallPrompt) && !isInstalled;

  return (
    <>
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-chart-1 to-chart-2 blur-lg opacity-50 rounded-full" />
                <div className="relative bg-gradient-to-br from-chart-1 to-chart-2 p-1.5 sm:p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
                  Crypto Market Assistant
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Binance Futures USD-M</p>
              </div>
            </div>

            {showInstallButton && (
              <Button
                onClick={() => setShowInstallDialog(true)}
                size="sm"
                className="bg-neon-orange hover:bg-neon-orange/90 text-primary-foreground shadow-lg shadow-neon-orange/20 hidden sm:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                Instalar App
              </Button>
            )}

            {showInstallButton && (
              <Button
                onClick={() => setShowInstallDialog(true)}
                size="icon"
                className="bg-neon-orange hover:bg-neon-orange/90 text-primary-foreground shadow-lg shadow-neon-orange/20 sm:hidden h-9 w-9"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <PWAInstallDialog open={showInstallDialog} onOpenChange={setShowInstallDialog} />
    </>
  );
}
