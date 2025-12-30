/**
 * Ephemeral crypto state store
 * 
 * Stores encryption keys temporarily during operations.
 * Keys are persisted in IndexedDB for session restoration across page refreshes.
 */

import { create } from 'zustand';
import { storeEncryptionKey, getEncryptionKey, clearEncryptionKey } from '../utils/indexedDb';

interface CryptoState {
  encryptionKey: CryptoKey | null;
  setEncryptionKey: (key: CryptoKey | null) => void;
  clearKeys: () => void;
  restoreKey: () => Promise<void>;
}

export const useCryptoStore = create<CryptoState>((set) => ({
  encryptionKey: null,
  setEncryptionKey: async (key) => {
    set({ encryptionKey: key });
    // Persist key to IndexedDB for session restoration
    if (key) {
      try {
        await storeEncryptionKey(key);
      } catch (error) {
        console.error('Failed to persist encryption key:', error);
        // Continue even if persistence fails
      }
    } else {
      try {
        await clearEncryptionKey();
      } catch (error) {
        console.error('Failed to clear encryption key:', error);
      }
    }
  },
  clearKeys: async () => {
    set({ encryptionKey: null });
    try {
      await clearEncryptionKey();
    } catch (error) {
      console.error('Failed to clear encryption key:', error);
    }
  },
  restoreKey: async () => {
    try {
      const key = await getEncryptionKey();
      if (key) {
        set({ encryptionKey: key });
      }
    } catch (error) {
      console.error('Failed to restore encryption key:', error);
    }
  },
}));

