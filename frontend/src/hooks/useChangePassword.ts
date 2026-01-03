/**
 * Password change hook
 * 
 * Handles password change by:
 * 1. Getting user's single vault
 * 2. Decrypting vault with old password
 * 3. Re-encrypting vault with new password
 * 4. Sending combined request to update user credentials and vault atomically
 */

import { useState } from 'react';
import { changePassword } from '../api/authApi';
import { getVault } from '../api/vaultApi';
import { deriveKey } from '../crypto/deriveKey';
import { encrypt } from '../crypto/encrypt';
import { decrypt } from '../crypto/decrypt';
import { generateSalt } from '../crypto/generateSalt';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../utils/arrayBufferUtils';
import { useAuthStore } from '../store/authStore';
import { useCryptoStore } from '../store/cryptoStore';
import { useHabitStore } from '../store/habitStore';
import { storeSalt, getSalt } from '../utils/saltStorage';
import { syncFromServer } from '../utils/syncService';
import { clearEncryptedBlobs } from '../utils/indexedDb';

export function useChangePassword(): {
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const username = useAuthStore((state) => state.username);
  const vaultId = useAuthStore((state) => state.vaultId);
  const { setEncryptionKey } = useCryptoStore();
  const setHabitData = useHabitStore((state) => state.setHabitData);

  const handleChangePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    if (!username) {
      throw new Error('User not authenticated');
    }

    if (!vaultId) {
      throw new Error('No vault found. Please create a habit first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current salt
      const oldSalt = getSalt(username);
      if (!oldSalt) {
        throw new Error('Salt not found. Please log out and log back in.');
      }

      // Derive keys from old password
      const { encryptionKey: oldEncryptionKey, authString: oldAuthString } =
        await deriveKey({
          username,
          password: oldPassword,
          salt: oldSalt,
        });

      // Get user's single vault
      const vault = await getVault(vaultId);

      // Decrypt vault with old key
      let plaintext: string;
      try {
        plaintext = await decrypt(
          {
            ciphertext: vault.ciphertext,
            iv: vault.iv,
          },
          oldEncryptionKey
        );
      } catch (err) {
        throw new Error(
          `Failed to decrypt vault: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`
        );
      }

      // Generate new salt
      const newSalt = await generateSalt();
      const newSaltBase64 = arrayBufferToBase64(newSalt);

      // Derive keys from new password
      const { encryptionKey: newEncryptionKey, authString: newAuthString } =
        await deriveKey({
          username,
          password: newPassword,
          salt: newSalt,
        });

      // Re-encrypt vault with new key
      const encrypted = await encrypt(plaintext, newEncryptionKey);

      // Send combined request to update user credentials and vault atomically
      await changePassword({
        old_auth_hash: oldAuthString,
        new_auth_hash: newAuthString,
        new_salt: newSaltBase64,
        vault_ciphertext: encrypted.ciphertext,
        vault_iv: encrypted.iv,
        vault_version: vault.version,
      });

      // Update local salt storage
      storeSalt(username, newSalt);

      // Update encryption key in store
      await setEncryptionKey(newEncryptionKey);

      // Clear IndexedDB cache to remove old encrypted blob
      await clearEncryptedBlobs();

      // Re-fetch vault from server and decrypt with new key
      // This ensures we have the latest data encrypted with the new key
      const habitData = await syncFromServer(vaultId, newEncryptionKey);

      // Update habit store with decrypted data
      setHabitData(habitData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Password change failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    changePassword: handleChangePassword,
    isLoading,
    error,
  };
}

