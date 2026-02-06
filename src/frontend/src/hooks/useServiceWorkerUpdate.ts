import { useEffect, useState } from 'react';

interface ServiceWorkerUpdateState {
  isUpdateAvailable: boolean;
  updateAndReload: () => void;
}

export function useServiceWorkerUpdate(): ServiceWorkerUpdateState {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      console.log('[SW Update] New service worker activated, reloading...');
      window.location.reload();
    };

    const handleUpdateFound = (registration: ServiceWorkerRegistration) => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      console.log('[SW Update] New service worker installing...');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[SW Update] New service worker installed and waiting');
          setIsUpdateAvailable(true);
          setWaitingWorker(newWorker);
        }
      });
    };

    // Check for existing registration
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      // Check if there's already a waiting worker
      if (registration.waiting) {
        console.log('[SW Update] Service worker already waiting');
        setIsUpdateAvailable(true);
        setWaitingWorker(registration.waiting);
      }

      // Listen for new updates
      registration.addEventListener('updatefound', () => handleUpdateFound(registration));
    });

    // Listen for controller changes (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const updateAndReload = () => {
    if (waitingWorker) {
      console.log('[SW Update] Sending SKIP_WAITING message to waiting worker');
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    isUpdateAvailable,
    updateAndReload,
  };
}
