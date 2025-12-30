/**
 * Authentication hook
 */

import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useHabitStore } from '../store/habitStore';
import { useCryptoStore } from '../store/cryptoStore';
import { register, login } from '../api/authApi';
import { deriveKey } from '../crypto/deriveKey';
import { generateSalt } from '../crypto/generateSalt';
import { syncFromServer } from '../utils/syncService';
import { setAuthToken } from '../api/apiClient';
import { storeSalt, getSalt } from '../utils/saltStorage';
import { arrayBufferToBase64 } from '../utils/arrayBufferUtils';
import type { HabitData } from '../types/HabitTypes';

export function useAuth(): {
  handleLogin: (username: string, password: string) => Promise<void>;
  handleRegister: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} {
  const loginUser = useAuthStore((state) => state.login);
  const setHabitData = useHabitStore((state) => state.setHabitData);
  const setEncryptionKey = useCryptoStore((state) => state.setEncryptionKey);
  const clearKeys = useCryptoStore((state) => state.clearKeys);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get or generate salt for this username
      let salt = getSalt(username);
      if (!salt) {
        salt = await generateSalt();
        storeSalt(username, salt);
      }

      // Derive keys
      const { encryptionKey, authString } = await deriveKey({
        username,
        password,
        salt,
      });

      // Authenticate with server
      const response = await login({
        username,
        auth_hash: authString,
      });

      // Store auth token and user info
      setAuthToken(response.access_token);
      loginUser(username, response.access_token, response.vault_id || undefined);

      // Store encryption key temporarily
      setEncryptionKey(encryptionKey);

      // Fetch and decrypt vault if vault ID exists
      if (response.vault_id) {
        const habitData = await syncFromServer(response.vault_id, encryptionKey);
        setHabitData(habitData);
      } else {
        // Create empty habit data for new user
        const emptyHabitData: HabitData = {
          habits: [],
          lastModified: new Date().toISOString(),
          version: 1,
        };
        setHabitData(emptyHabitData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      clearKeys();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate salt for new user
      const salt = await generateSalt();
      storeSalt(username, salt);

      // Derive keys
      const { encryptionKey, authString } = await deriveKey({
        username,
        password,
        salt,
      });

      // Register with server (include salt)
      const saltBase64 = arrayBufferToBase64(salt);
      const response = await register({
        username,
        auth_hash: authString,
        salt: saltBase64,
      });

      // Store auth token and user info
      setAuthToken(response.access_token);
      loginUser(username, response.access_token, response.vault_id || undefined);

      // Store encryption key temporarily
      setEncryptionKey(encryptionKey);

      // Create empty habit data for new user
      const emptyHabitData: HabitData = {
        habits: [],
        lastModified: new Date().toISOString(),
        version: 1,
      };
      setHabitData(emptyHabitData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      clearKeys();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    handleRegister,
    isLoading,
    error,
  };
}

