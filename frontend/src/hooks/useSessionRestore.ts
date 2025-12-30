/**
 * Hook to restore user session on app initialization
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCryptoStore } from '../store/cryptoStore';
import { useHabitStore } from '../store/habitStore';
import { syncFromServer } from '../utils/syncService';

/**
 * Hook to restore session from persisted storage
 */
export function useSessionRestore(): {
  isRestoring: boolean;
  isRestored: boolean;
} {
  const [isRestoring, setIsRestoring] = useState(true);
  const [isRestored, setIsRestored] = useState(false);

  const restoreSession = useAuthStore((state) => state.restoreSession);
  const username = useAuthStore((state) => state.username);
  const vaultId = useAuthStore((state) => state.vaultId);
  const token = useAuthStore((state) => state.token);
  const restoreKey = useCryptoStore((state) => state.restoreKey);
  const setHabitData = useHabitStore((state) => state.setHabitData);
  const setEncryptionKey = useCryptoStore((state) => state.setEncryptionKey);
  const encryptionKey = useCryptoStore((state) => state.encryptionKey);

  useEffect(() => {
    async function restore(): Promise<void> {
      try {
        // Restore auth state from localStorage
        restoreSession();

        // Restore encryption key from IndexedDB
        await restoreKey();

        // Wait a bit for state to update, then check if we have everything
        await new Promise((resolve) => setTimeout(resolve, 100));

        // If we have both auth token and encryption key, restore habit data
        const currentToken = useAuthStore.getState().token;
        const currentKey = useCryptoStore.getState().encryptionKey;
        const currentVaultId = useAuthStore.getState().vaultId;

        if (currentToken && currentKey && currentVaultId) {
          try {
            // Fetch and decrypt vault from server
            const habitData = await syncFromServer(currentVaultId, currentKey);
            setHabitData(habitData);
          } catch (error) {
            console.error('Failed to restore habit data:', error);
            // If restore fails, user will need to log in again
            // Clear the session
            useAuthStore.getState().logout();
            await useCryptoStore.getState().clearKeys();
          }
        } else if (currentToken && !currentKey) {
          // Have token but no key - session is invalid, clear it
          useAuthStore.getState().logout();
          await useCryptoStore.getState().clearKeys();
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Clear invalid session
        useAuthStore.getState().logout();
        await useCryptoStore.getState().clearKeys();
      } finally {
        setIsRestoring(false);
        setIsRestored(true);
      }
    }

    restore();
  }, []); // Only run once on mount

  return {
    isRestoring,
    isRestored,
  };
}

