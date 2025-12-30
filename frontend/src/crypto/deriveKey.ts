/**
 * Key derivation using PBKDF2-HMAC-SHA256
 */

import { CRYPTO_CONFIG } from '../constants/CRYPTO_CONFIG';
import { CryptoError } from './CryptoError';
import type { DerivedKeys, KeyDerivationParams } from '../types/CryptoTypes';
import { stringToArrayBuffer, arrayBufferToBase64 } from '../utils/arrayBufferUtils';

/**
 * Derive encryption key and authentication string from username, password, and salt
 * 
 * Uses PBKDF2-HMAC-SHA256 with 600,000 iterations to derive:
 * - K_enc: Encryption key for AES-256-GCM
 * - H_auth: Authentication string for server authentication
 * 
 * @param params - Key derivation parameters
 * @returns Promise resolving to derived keys
 * @throws {CryptoError} If key derivation fails
 */
export async function deriveKey(
  params: KeyDerivationParams
): Promise<DerivedKeys> {
  const { username, password, salt } = params;

  try {
    // Concatenate username + password + salt for key derivation
    const keyMaterial = `${username}${password}`;
    const keyMaterialBuffer = stringToArrayBuffer(keyMaterial);

    // Import the key material
    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyMaterialBuffer,
      'PBKDF2',
      false,
      ['deriveKey', 'deriveBits']
    );

    // Derive encryption key (K_enc)
    const encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: CRYPTO_CONFIG.PBKDF2.ITERATIONS,
        hash: CRYPTO_CONFIG.PBKDF2.HASH,
      },
      importedKey,
      {
        name: CRYPTO_CONFIG.AES.ALGORITHM,
        length: CRYPTO_CONFIG.AES.KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );

    // Derive authentication string (H_auth) - same process but for auth
    const authBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: CRYPTO_CONFIG.PBKDF2.ITERATIONS,
        hash: CRYPTO_CONFIG.PBKDF2.HASH,
      },
      importedKey,
      CRYPTO_CONFIG.PBKDF2.KEY_LENGTH
    );

    const authString = arrayBufferToBase64(authBits);

    return {
      encryptionKey,
      authString,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new CryptoError(
        `Key derivation failed: ${error.message}`,
        'KEY_DERIVATION_ERROR'
      );
    }
    throw new CryptoError(
      'Key derivation failed: Unknown error',
      'KEY_DERIVATION_ERROR'
    );
  }
}

