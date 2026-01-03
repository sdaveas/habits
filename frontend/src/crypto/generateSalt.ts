/**
 * Generate cryptographically secure salt
 */

import { CRYPTO_CONFIG } from '../constants/CRYPTO_CONFIG';
import { getCrypto } from './cryptoUtils';

/**
 * Generate a random 32-byte salt using cryptographically secure RNG
 * @returns Promise resolving to ArrayBuffer containing the salt
 */
export async function generateSalt(): Promise<ArrayBuffer> {
  const crypto = getCrypto();
  const salt = new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH);
  crypto.getRandomValues(salt);
  return salt.buffer;
}

