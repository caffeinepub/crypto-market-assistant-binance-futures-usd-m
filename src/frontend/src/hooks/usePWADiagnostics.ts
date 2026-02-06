import { useEffect, useState } from 'react';

export interface PWADiagnostics {
  displayMode: string;
  hasBeforeInstallPrompt: boolean;
  hasServiceWorker: boolean;
  serviceWorkerState: string;
  manifestFetchStatus: 'pending' | 'success' | 'error';
  manifestError?: string;
  iconChecks: Array<{
    url: string;
    status: 'pending' | 'success' | 'error';
    httpStatus?: number;
  }>;
  issues: string[];
  isReady: boolean;
}

const CRITICAL_ICONS = [
  '/assets/generated/app-icon-192.dim_192x192.png',
  '/assets/generated/app-icon-512.dim_512x512.png',
  '/assets/generated/app-icon-maskable.dim_512x512.png',
];

export function usePWADiagnostics(): PWADiagnostics {
  const [diagnostics, setDiagnostics] = useState<PWADiagnostics>({
    displayMode: 'browser',
    hasBeforeInstallPrompt: false,
    hasServiceWorker: false,
    serviceWorkerState: 'none',
    manifestFetchStatus: 'pending',
    iconChecks: CRITICAL_ICONS.map(url => ({ url, status: 'pending' })),
    issues: [],
    isReady: false,
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const issues: string[] = [];

      // 1. Check display mode
      let displayMode = 'browser';
      if (window.matchMedia('(display-mode: standalone)').matches) {
        displayMode = 'standalone';
      } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        displayMode = 'minimal-ui';
      } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
        displayMode = 'fullscreen';
      } else if ((window.navigator as any).standalone) {
        displayMode = 'standalone-ios';
      } else if (document.referrer.includes('android-app://')) {
        displayMode = 'standalone-android';
      }

      // 2. Check if beforeinstallprompt was received
      const hasBeforeInstallPrompt = localStorage.getItem('pwa-received-install-prompt') === 'true';
      if (!hasBeforeInstallPrompt && displayMode === 'browser') {
        issues.push('beforeinstallprompt event não foi disparado - app pode não ser reconhecido como instalável');
      }

      // 3. Check service worker
      const hasServiceWorker = 'serviceWorker' in navigator;
      let serviceWorkerState = 'none';
      if (hasServiceWorker) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          if (registration.active) {
            serviceWorkerState = 'active';
          } else if (registration.installing) {
            serviceWorkerState = 'installing';
          } else if (registration.waiting) {
            serviceWorkerState = 'waiting';
          }
        } else {
          serviceWorkerState = 'not-registered';
          issues.push('Service Worker não está registrado');
        }
      } else {
        issues.push('Service Worker não é suportado neste navegador');
      }

      // 4. Check manifest fetch
      let manifestFetchStatus: 'pending' | 'success' | 'error' = 'pending';
      let manifestError: string | undefined;
      try {
        const manifestResponse = await fetch('/manifest.json', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        if (manifestResponse.ok) {
          manifestFetchStatus = 'success';
        } else {
          manifestFetchStatus = 'error';
          manifestError = `HTTP ${manifestResponse.status}`;
          issues.push(`Manifest retornou status ${manifestResponse.status}`);
        }
      } catch (error) {
        manifestFetchStatus = 'error';
        manifestError = error instanceof Error ? error.message : 'Erro desconhecido';
        issues.push(`Falha ao buscar manifest: ${manifestError}`);
      }

      // 5. Check critical icons
      const iconChecks = await Promise.all(
        CRITICAL_ICONS.map(async (url) => {
          try {
            const response = await fetch(url, { 
              method: 'HEAD',
              cache: 'no-cache'
            });
            if (response.ok) {
              return { url, status: 'success' as const, httpStatus: response.status };
            } else {
              issues.push(`Ícone ${url} retornou status ${response.status}`);
              return { url, status: 'error' as const, httpStatus: response.status };
            }
          } catch (error) {
            issues.push(`Falha ao buscar ícone ${url}`);
            return { url, status: 'error' as const };
          }
        })
      );

      // 6. Additional checks
      if (displayMode === 'browser' && !hasBeforeInstallPrompt) {
        issues.push('App não está em modo standalone e não recebeu evento de instalação');
      }

      setDiagnostics({
        displayMode,
        hasBeforeInstallPrompt,
        hasServiceWorker,
        serviceWorkerState,
        manifestFetchStatus,
        manifestError,
        iconChecks,
        issues,
        isReady: true,
      });
    };

    runDiagnostics();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = () => {
      setDiagnostics(prev => ({
        ...prev,
        hasBeforeInstallPrompt: true,
        issues: prev.issues.filter(i => !i.includes('beforeinstallprompt')),
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return diagnostics;
}
