/**
 * Sync hook for automatic and manual synchronization
 */

import { useEffect } from 'react';
import { useHabitStore } from '../store/habitStore';
import { useCryptoStore } from '../store/cryptoStore';
import { useAuthStore } from '../store/authStore';
import { syncToServer } from '../utils/syncService';
import { generateSalt } from '../crypto/generateSalt';
import { arrayBufferToBase64 } from '../utils/arrayBufferUtils';

let saltCache: ArrayBuffer | null = null;

/**
 * Get or generate salt for the current session
 */
async function getSessionSalt(): Promise<ArrayBuffer> {
  if (!saltCache) {
    saltCache = await generateSalt();
  }
  return saltCache;
}

/**
 * Hook for syncing habit data
 */
export function useSync(): {
  sync: () => Promise<void>;
  isSyncing: boolean;
  syncError: string | null;
} {
  const habitData = useHabitStore((state) => state.habitData);
  const syncStatus = useHabitStore((state) => state.syncStatus);
  const syncError = useHabitStore((state) => state.syncError);
  const setSyncStatus = useHabitStore((state) => state.setSyncStatus);
  const encryptionKey = useCryptoStore((state) => state.encryptionKey);
  const vaultId = useAuthStore((state) => state.vaultId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const sync = async (): Promise<void> => {
    if (!habitData || !encryptionKey || !isAuthenticated) {
      return;
    }

    try {
      setSyncStatus('syncing');
      const salt = await getSessionSalt();
      const newVaultId = await syncToServer(habitData, encryptionKey, vaultId || null, salt);
      
      // Update vault ID if it was newly created
      if (!vaultId && newVaultId) {
        useAuthStore.getState().login(
          useAuthStore.getState().username || '',
          useAuthStore.getState().token || '',
          newVaultId
        );
      }
      
      setSyncStatus('synced');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setSyncStatus('error', errorMessage);
    }
  };

  const needsSync = useHabitStore((state) => state.needsSync);
  const immediateSync = useHabitStore((state) => state.immediateSync);
  const setNeedsSync = useHabitStore((state) => state.setNeedsSync);
  const setImmediateSync = useHabitStore((state) => state.setImmediateSync);

  // Immediate sync for completion changes (no debounce)
  useEffect(() => {
    if (!immediateSync || !habitData || !encryptionKey || !isAuthenticated || syncStatus === 'syncing') {
      return;
    }

    sync()
      .then(() => {
        // Clear the immediateSync flag after successful sync
        setImmediateSync(false);
      })
      .catch(() => {
        // Error already handled in sync function
        // Keep immediateSync true so we can retry
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediateSync, encryptionKey, isAuthenticated, syncStatus]);

  // Debounced sync for other meaningful changes (add, update, delete)
  useEffect(() => {
    if (!needsSync || !habitData || !encryptionKey || !isAuthenticated || syncStatus === 'syncing') {
      return;
    }

    const timeoutId = setTimeout(() => {
      sync()
        .then(() => {
          // Clear the needsSync flag after successful sync
          setNeedsSync(false);
        })
        .catch(() => {
          // Error already handled in sync function
          // Keep needsSync true so we can retry
        });
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSync, encryptionKey, isAuthenticated, syncStatus]);

  return {
    sync,
    isSyncing: syncStatus === 'syncing',
    syncError,
  };
}

