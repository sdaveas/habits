/**
 * Delete account hook
 * 
 * Handles account deletion by:
 * 1. Deriving auth_hash from password
 * 2. Calling the delete account API with password verification
 * 3. Clearing all local storage and IndexedDB
 * 4. Logging out the user
 */

import { useState } from 'react';
import { deleteAccount } from '../api/authApi';
import { deriveKey } from '../crypto/deriveKey';
import { useAuthStore } from '../store/authStore';
import { useCryptoStore } from '../store/cryptoStore';
import { useHabitStore } from '../store/habitStore';
import { clearEncryptedBlobs } from '../utils/indexedDb';
import { getSalt } from '../utils/saltStorage';

export function useDeleteAccount(): {
  deleteAccount: (password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const clearKeys = useCryptoStore((state) => state.clearKeys);
  const clearHabitData = useHabitStore((state) => state.clearHabitData);

  const handleDeleteAccount = async (password: string): Promise<void> => {
    if (!username) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get salt for password verification
      const salt = getSalt(username);
      if (!salt) {
        throw new Error('Salt not found. Please log out and log back in.');
      }

      // Derive auth_hash from password
      const { authString } = await deriveKey({
        username,
        password,
        salt,
      });

      // Delete account on server with password verification
      await deleteAccount({
        password_auth_hash: authString,
      });

      // Clear all local data
      await clearEncryptedBlobs();
      clearKeys();
      clearHabitData();
      logout();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Account deletion failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteAccount: handleDeleteAccount,
    isLoading,
    error,
  };
}

