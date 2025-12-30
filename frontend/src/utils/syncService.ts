/**
 * Data synchronization service
 */

import { encrypt } from '../crypto/encrypt';
import { decrypt } from '../crypto/decrypt';
import { createVault, getVault, updateVault } from '../api/vaultApi';
import { storeEncryptedBlob, getEncryptedBlob } from './indexedDb';
import type { HabitData } from '../types/HabitTypes';
import type { VaultBlob } from '../types/VaultTypes';
import { v4 as uuidv4 } from 'uuid';
import { arrayBufferToBase64 } from './arrayBufferUtils';

/**
 * Sync habit data to server
 */
export async function syncToServer(
  habitData: HabitData,
  encryptionKey: CryptoKey,
  vaultId: string | null,
  salt: ArrayBuffer
): Promise<string> {
  // Encrypt habit data
  const plaintext = JSON.stringify(habitData);
  const encrypted = await encrypt(plaintext, encryptionKey);

  // Create vault blob
  const blob: VaultBlob = {
    vault_id: vaultId || uuidv4(),
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    salt: arrayBufferToBase64(salt),
    version: 1,
  };

  // Store in IndexedDB cache
  await storeEncryptedBlob(blob);

  // Sync to server
  if (vaultId) {
    await updateVault(vaultId, blob);
  } else {
    const response = await createVault(blob);
    return response.vault_id;
  }

  return blob.vault_id;
}

/**
 * Sync habit data from server
 */
export async function syncFromServer(
  vaultId: string,
  encryptionKey: CryptoKey
): Promise<HabitData> {
  // Try to get from IndexedDB cache first
  let blob = await getEncryptedBlob(vaultId);

  // If not in cache, fetch from server
  if (!blob) {
    blob = await getVault(vaultId);
    // Cache it for offline use
    if (blob) {
      await storeEncryptedBlob(blob);
    }
  }

  if (!blob) {
    throw new Error('Vault not found');
  }

  // Decrypt blob
  const plaintext = await decrypt(
    {
      ciphertext: blob.ciphertext,
      iv: blob.iv,
    },
    encryptionKey
  );

  return JSON.parse(plaintext) as HabitData;
}

