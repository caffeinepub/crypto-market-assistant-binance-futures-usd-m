/**
 * Reset orchestrator for clearing all local app data and state
 * Clears: IndexedDB (AI learning), localStorage (settings), React Query cache, and service worker caches
 */

const RESET_SUCCESS_FLAG = 'reset-from-scratch-success';

export interface ResetResult {
  success: boolean;
  error?: string;
}

/**
 * Clear all IndexedDB databases used by the app
 */
async function clearIndexedDB(): Promise<void> {
  const databases = await indexedDB.databases();
  
  for (const db of databases) {
    if (db.name) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(db.name!);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(`Failed to delete database: ${db.name}`));
        request.onblocked = () => {
          console.warn(`Database deletion blocked: ${db.name}`);
          // Still resolve - we'll try again on next reset
          resolve();
        };
      });
    }
  }
}

/**
 * Clear all localStorage keys
 */
function clearLocalStorage(): void {
  localStorage.clear();
}

/**
 * Clear all CacheStorage caches
 */
async function clearCacheStorage(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

/**
 * Unregister all service workers
 */
async function unregisterServiceWorkers(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
  }
}

/**
 * Main reset function - orchestrates all cleanup operations
 */
export async function resetFromScratch(): Promise<ResetResult> {
  try {
    // Clear IndexedDB (AI learning data)
    await clearIndexedDB();
    
    // Clear CacheStorage (app caches)
    await clearCacheStorage();
    
    // Unregister service workers
    await unregisterServiceWorkers();
    
    // Set success flag before clearing localStorage
    localStorage.setItem(RESET_SUCCESS_FLAG, 'true');
    
    // Clear localStorage (settings, preferences)
    // Note: We set the flag first, then clear everything except the flag
    const successFlag = localStorage.getItem(RESET_SUCCESS_FLAG);
    clearLocalStorage();
    if (successFlag) {
      localStorage.setItem(RESET_SUCCESS_FLAG, successFlag);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Reset from scratch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during reset',
    };
  }
}

/**
 * Check if we just completed a reset (for showing success message)
 */
export function checkResetSuccess(): boolean {
  const flag = localStorage.getItem(RESET_SUCCESS_FLAG);
  if (flag === 'true') {
    localStorage.removeItem(RESET_SUCCESS_FLAG);
    return true;
  }
  return false;
}

/**
 * Trigger a clean reload after reset
 */
export function reloadApp(): void {
  window.location.href = window.location.origin + window.location.pathname;
}
