/**
 * AES-256-GCM encryption
 */

import { CRYPTO_CONFIG } from '../constants/CRYPTO_CONFIG';
import { CryptoError } from './CryptoError';
import type { EncryptedData } from '../types/CryptoTypes';
import { arrayBufferToBase64 } from '../utils/arrayBufferUtils';
import { getCrypto, getSubtleCrypto } from './cryptoUtils';

/**
 * Encrypt plaintext using AES-256-GCM
 * 
 * Generates a unique 12-byte IV for each encryption operation.
 * 
 * @param plaintext - Plaintext string to encrypt
 * @param key - CryptoKey for AES-256-GCM encryption
 * @returns Promise resolving to encrypted data with IV
 * @throws {CryptoError} If encryption fails
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<EncryptedData> {
  try {
    const crypto = getCrypto();
    const subtle = getSubtleCrypto();
    
    // Generate random IV for this encryption
    const iv = new Uint8Array(CRYPTO_CONFIG.AES.IV_LENGTH);
    crypto.getRandomValues(iv);

    // Convert plaintext to ArrayBuffer
    const encoder = new TextEncoder();
    const plaintextBuffer = encoder.encode(plaintext);

    // Encrypt using AES-GCM
    const ciphertext = await subtle.encrypt(
      {
        name: CRYPTO_CONFIG.AES.ALGORITHM,
        iv: iv,
        tagLength: CRYPTO_CONFIG.AES.TAG_LENGTH,
      },
      key,
      plaintextBuffer
    );

    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv.buffer),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new CryptoError(
        `Encryption failed: ${error.message}`,
        'ENCRYPTION_ERROR'
      );
    }
    throw new CryptoError(
      'Encryption failed: Unknown error',
      'ENCRYPTION_ERROR'
    );
  }
}

