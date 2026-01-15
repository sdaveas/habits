/**
 * Wallet-based authentication hook
 *
 * Handles wallet connection, signature generation, and authentication flow.
 */

import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useHabitStore } from '../store/habitStore';
import { useCryptoStore } from '../store/cryptoStore';
import { walletLogin, walletRegister } from '../api/authApi';
import {
  deriveKeyFromWalletSignature,
  generateAuthMessage,
  WALLET_AUTH_CONFIG,
} from '../crypto/deriveKeyFromWallet';
import { syncFromServer } from '../utils/syncService';
import { setAuthToken } from '../api/apiClient';
import type { HabitData } from '../types/HabitTypes';
import { useWallet } from './useWallet';

export interface UseWalletAuthReturn {
  handleWalletLogin: () => Promise<void>;
  handleWalletRegister: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  wallet: ReturnType<typeof useWallet>['wallet'];
}

/**
 * Hook for wallet-based authentication
 *
 * Orchestrates the complete wallet authentication flow:
 * 1. Connect wallet
 * 2. Generate deterministic message
 * 3. Request signature
 * 4. Derive keys from signature
 * 5. Authenticate with backend
 * 6. Store keys and fetch vault
 */
export function useWalletAuth(): UseWalletAuthReturn {
  const loginUser = useAuthStore((state) => state.login);
  const setHabitData = useHabitStore((state) => state.setHabitData);
  const setEncryptionKey = useCryptoStore((state) => state.setEncryptionKey);
  const clearKeys = useCryptoStore((state) => state.clearKeys);

  const { connectWallet, signMessage, wallet } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle wallet login
   */
  const handleWalletLogin = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Connect wallet
      const address = await connectWallet();

      // Generate deterministic message
      const message = generateAuthMessage(
        address,
        WALLET_AUTH_CONFIG.MESSAGE_VERSION
      );

      // Request signature
      const signature = await signMessage(message);

      // Derive keys from signature
      const { encryptionKey, authString } = await deriveKeyFromWalletSignature(
        signature
      );

      // Authenticate with backend
      const response = await walletLogin({
        wallet_address: address.toLowerCase(),
        signature,
        message,
        message_version: WALLET_AUTH_CONFIG.MESSAGE_VERSION,
      });

      // Store auth token and user info (use wallet address as "username")
      setAuthToken(response.access_token);
      loginUser(
        address,
        response.access_token,
        response.vault_id || undefined,
        'wallet'
      );

      // Store encryption key
      setEncryptionKey(encryptionKey);

      // Fetch and decrypt vault if exists
      if (response.vault_id) {
        const habitData = await syncFromServer(response.vault_id, encryptionKey);
        setHabitData(habitData);
      } else {
        // New user - empty habit data
        const emptyHabitData: HabitData = {
          habits: [],
          lastModified: new Date().toISOString(),
          version: 1,
        };
        setHabitData(emptyHabitData);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Wallet authentication failed';
      setError(errorMessage);
      clearKeys();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle wallet registration
   */
  const handleWalletRegister = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Connect wallet
      const address = await connectWallet();

      // Generate deterministic message
      const message = generateAuthMessage(
        address,
        WALLET_AUTH_CONFIG.MESSAGE_VERSION
      );

      // Request signature
      const signature = await signMessage(message);

      // Derive keys from signature
      const { encryptionKey, authString } = await deriveKeyFromWalletSignature(
        signature
      );

      // Register with backend
      const response = await walletRegister({
        wallet_address: address.toLowerCase(),
        signature,
        message,
        message_version: WALLET_AUTH_CONFIG.MESSAGE_VERSION,
      });

      // Store auth token and user info
      setAuthToken(response.access_token);
      loginUser(
        address,
        response.access_token,
        response.vault_id || undefined,
        'wallet'
      );

      // Store encryption key
      setEncryptionKey(encryptionKey);

      // Create empty habit data
      const emptyHabitData: HabitData = {
        habits: [],
        lastModified: new Date().toISOString(),
        version: 1,
      };
      setHabitData(emptyHabitData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Wallet registration failed';
      setError(errorMessage);
      clearKeys();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleWalletLogin,
    handleWalletRegister,
    isLoading,
    error,
    wallet,
  };
}
