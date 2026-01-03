/**
 * Authentication hook
 */

import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useHabitStore } from '../store/habitStore';
import { useCryptoStore } from '../store/cryptoStore';
import { register, login, getSalts } from '../api/authApi';
import { deriveKey } from '../crypto/deriveKey';
import { generateSalt } from '../crypto/generateSalt';
import { syncFromServer } from '../utils/syncService';
import { setAuthToken } from '../api/apiClient';
import { storeSalt, getSalt } from '../utils/saltStorage';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../utils/arrayBufferUtils';
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
      // Get salt from sessionStorage first (for performance)
      let salt = getSalt(username);
      let saltsToTry: ArrayBuffer[] = [];
      
      if (salt) {
        // If we have a salt in sessionStorage, try it first
        saltsToTry = [salt];
      } else {
        // If no salt in sessionStorage, fetch all salts from server
        // (needed when accessing from different origin, e.g., IP vs localhost)
        try {
          const saltsResponse = await getSalts(username);
          if (saltsResponse.salts && saltsResponse.salts.length > 0) {
            saltsToTry = saltsResponse.salts.map((s) => base64ToArrayBuffer(s));
          } else {
            // No salts found - user doesn't exist or wrong username
            throw new Error('User not found. Please check your username.');
          }
        } catch (err) {
          // If getSalts fails, re-throw with a more helpful error message
          if (err instanceof Error) {
            if (err.message.includes('User not found')) {
              throw err;
            }
            // Network or server error
            throw new Error(`Failed to retrieve user information: ${err.message}. Please check your connection and try again.`);
          }
          throw new Error('Failed to retrieve user information. Please check your connection and try again.');
        }
      }

      // Try each salt until one works
      let lastError: Error | null = null;
      for (const saltToTry of saltsToTry) {
        try {
          // Derive keys with this salt
          const { encryptionKey, authString } = await deriveKey({
            username,
            password,
            salt: saltToTry,
          });

          // Authenticate with server
          const response = await login({
            username,
            auth_hash: authString,
          });

          // Success! Store the salt that worked
          storeSalt(username, saltToTry);

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
          
          // Success - return early
          return;
        } catch (err) {
          // Save error and try next salt
          if (err instanceof Error) {
            // If it's an APIError with 401, it means wrong password for this salt
            // We'll try the next salt if available
            if ('status' in err && (err as { status: number }).status === 401) {
              lastError = new Error('Invalid username or password');
            } else {
              lastError = err;
            }
          } else {
            lastError = new Error('Authentication failed');
          }
          continue;
        }
      }

      // If we get here, all salts failed
      if (lastError) {
        // If we tried multiple salts and all failed, it's likely wrong password
        if (saltsToTry.length > 1) {
          throw new Error('Invalid username or password. Please check your credentials.');
        }
        throw lastError;
      }
      throw new Error('Authentication failed. Please check your username and password.');
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

