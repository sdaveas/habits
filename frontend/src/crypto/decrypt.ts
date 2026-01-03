/**
 * AES-256-GCM decryption
 */

import { CRYPTO_CONFIG } from '../constants/CRYPTO_CONFIG';
import { CryptoError } from './CryptoError';
import type { EncryptedData } from '../types/CryptoTypes';
import { base64ToArrayBuffer, arrayBufferToString } from '../utils/arrayBufferUtils';
import { getSubtleCrypto } from './cryptoUtils';

/**
 * Decrypt ciphertext using AES-256-GCM
 * 
 * Verifies the authentication tag to ensure data integrity.
 * 
 * @param encryptedData - Encrypted data with IV
 * @param key - CryptoKey for AES-256-GCM decryption
 * @returns Promise resolving to decrypted plaintext string
 * @throws {CryptoError} If decryption fails or authentication tag is invalid
 */
export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<string> {
  try {
    const subtle = getSubtleCrypto();
    const { ciphertext, iv } = encryptedData;

    // Convert base64 strings to ArrayBuffers
    const ciphertextBuffer = base64ToArrayBuffer(ciphertext);
    const ivBuffer = base64ToArrayBuffer(iv);

    // Decrypt using AES-GCM (automatically verifies authentication tag)
    const plaintextBuffer = await subtle.decrypt(
      {
        name: CRYPTO_CONFIG.AES.ALGORITHM,
        iv: ivBuffer,
        tagLength: CRYPTO_CONFIG.AES.TAG_LENGTH,
      },
      key,
      ciphertextBuffer
    );

    // Convert ArrayBuffer to string
    return arrayBufferToString(plaintextBuffer);
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's an authentication failure
      if (error.name === 'OperationError' || error.message.includes('tag')) {
        throw new CryptoError(
          'Decryption failed: Authentication tag verification failed',
          'AUTHENTICATION_FAILED'
        );
      }
      throw new CryptoError(
        `Decryption failed: ${error.message}`,
        'DECRYPTION_ERROR'
      );
    }
    throw new CryptoError(
      'Decryption failed: Unknown error',
      'DECRYPTION_ERROR'
    );
  }
}

