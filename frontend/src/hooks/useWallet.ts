/**
 * Wallet connection and signing hook
 *
 * Handles MetaMask/Web3 wallet connection, account management, and message signing.
 */

import { useState, useCallback } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
}

export interface UseWalletReturn {
  wallet: WalletState;
  connectWallet: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  disconnectWallet: () => void;
  isMetaMaskInstalled: boolean;
}

/**
 * Hook for wallet connection and message signing
 *
 * Supports MetaMask and other EIP-1193 compatible wallets.
 * Works with all EVM chains (Ethereum, Polygon, BSC, Arbitrum, etc.)
 */
export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: true, // We don't enforce network for auth
  });

  const isMetaMaskInstalled =
    typeof window !== 'undefined' &&
    typeof window.ethereum !== 'undefined' &&
    window.ethereum.isMetaMask;

  /**
   * Connect to MetaMask wallet
   * @returns Promise resolving to wallet address
   * @throws {Error} If MetaMask is not installed or connection fails
   */
  const connectWallet = useCallback(async (): Promise<string> => {
    if (!isMetaMaskInstalled) {
      throw new Error(
        'MetaMask is not installed. Please install MetaMask to continue.'
      );
    }

    try {
      // Request account access
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const address = accounts[0];

      // Get chain ID
      const chainId = await window.ethereum!.request({
        method: 'eth_chainId',
      });

      setWallet({
        isConnected: true,
        address,
        chainId: parseInt(chainId, 16),
        isCorrectNetwork: true,
      });

      return address;
    } catch (error) {
      if (error instanceof Error) {
        // User rejected connection
        if (
          error.message.includes('User rejected') ||
          error.message.includes('User denied')
        ) {
          throw new Error(
            'Connection rejected. Please approve the connection request.'
          );
        }
        throw error;
      }
      throw new Error('Failed to connect wallet');
    }
  }, [isMetaMaskInstalled]);

  /**
   * Sign a message with the connected wallet
   *
   * Uses personal_sign (EIP-191) for deterministic signatures.
   *
   * @param message - The message to sign
   * @returns Promise resolving to signature (hex string with 0x prefix)
   * @throws {Error} If wallet is not connected or signing fails
   */
  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!wallet.isConnected || !wallet.address) {
        throw new Error(
          'Wallet not connected. Please connect your wallet first.'
        );
      }

      if (!isMetaMaskInstalled) {
        throw new Error('MetaMask is not installed.');
      }

      try {
        // Use personal_sign (EIP-191) for deterministic signatures
        const signature = await window.ethereum!.request({
          method: 'personal_sign',
          params: [message, wallet.address],
        });

        return signature;
      } catch (error) {
        if (error instanceof Error) {
          if (
            error.message.includes('User rejected') ||
            error.message.includes('User denied')
          ) {
            throw new Error(
              'Signature rejected. Please approve the signature request.'
            );
          }
          throw error;
        }
        throw new Error('Failed to sign message');
      }
    },
    [wallet.isConnected, wallet.address, isMetaMaskInstalled]
  );

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: true,
    });
  }, []);

  return {
    wallet,
    connectWallet,
    signMessage,
    disconnectWallet,
    isMetaMaskInstalled,
  };
}
