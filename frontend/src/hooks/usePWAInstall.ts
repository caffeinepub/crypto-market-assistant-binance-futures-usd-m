import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOSDevice: boolean;
  isNotSupported: boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
  isDismissed: boolean;
  hasReceivedInstallPrompt: boolean;
  displayMode: string;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasReceivedInstallPrompt, setHasReceivedInstallPrompt] = useState(false);
  const [displayMode, setDisplayMode] = useState('browser');

  useEffect(() => {
    // Detect current display mode
    const detectDisplayMode = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
      }
      if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return 'minimal-ui';
      }
      if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return 'fullscreen';
      }
      if ((window.navigator as any).standalone) {
        return 'standalone-ios';
      }
      if (document.referrer.includes('android-app://')) {
        return 'standalone-android';
      }
      return 'browser';
    };

    const mode = detectDisplayMode();
    setDisplayMode(mode);

    // Check if running in standalone mode (already installed)
    const standalone = mode !== 'browser';
    setIsInstalled(standalone);

    // Check if iOS device
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOSDevice(ios);

    // Check dismissal state
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    setIsDismissed(daysSinceDismissed < 7);

    // Listen for beforeinstallprompt event (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('[PWA] beforeinstallprompt event fired - app is installable');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setHasReceivedInstallPrompt(true);
      // Store that we received the prompt
      localStorage.setItem('pwa-received-install-prompt', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if we previously received the install prompt
    const previouslyReceivedPrompt = localStorage.getItem('pwa-received-install-prompt') === 'true';
    if (previouslyReceivedPrompt) {
      setHasReceivedInstallPrompt(true);
    }

    // Listen for display mode changes
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      const newMode = detectDisplayMode();
      setDisplayMode(newMode);
      setIsInstalled(newMode !== 'browser');
    };

    if (standaloneQuery.addEventListener) {
      standaloneQuery.addEventListener('change', handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (standaloneQuery.removeEventListener) {
        standaloneQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn('[PWA] No deferred prompt available');
      return;
    }

    try {
      console.log('[PWA] Showing install prompt...');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`[PWA] User choice: ${outcome}`);
      if (outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA] Installation error:', error);
    }
  };

  const dismissPrompt = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setIsDismissed(true);
  };

  const isInstallable = !!deferredPrompt || (isIOSDevice && !isInstalled);
  const isNotSupported = !isInstallable && !isInstalled && !isIOSDevice;

  return {
    isInstallable,
    isInstalled,
    isIOSDevice,
    isNotSupported,
    promptInstall,
    dismissPrompt,
    isDismissed,
    hasReceivedInstallPrompt,
    displayMode,
  };
}
