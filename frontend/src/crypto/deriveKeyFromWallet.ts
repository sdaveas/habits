/**
 * Key derivation from wallet signature
 *
 * Derives encryption key and auth string from wallet signature using HKDF.
 * CRITICAL: The signature must be deterministic (same message always produces same signature).
 */

import { CRYPTO_CONFIG } from '../constants/CRYPTO_CONFIG';
import { CryptoError } from './CryptoError';
import type { DerivedKeys } from '../types/CryptoTypes';
import {
  hexToArrayBuffer,
  arrayBufferToBase64,
  stringToArrayBuffer,
} from '../utils/arrayBufferUtils';
import { getSubtleCrypto } from './cryptoUtils';

export const WALLET_AUTH_CONFIG = {
  MESSAGE_VERSION: 1,
  // Fixed message template - NEVER change this
  MESSAGE_TEMPLATE:
    'Sign this message to authenticate with your zero-knowledge habit tracker.\n\nThis signature will be used to derive your encryption key.\n\nMessage Version: {version}\nAddress: {address}',
  FIXED_SALT: new Uint8Array(32), // All zeros - deterministic
} as const;

/**
 * Generate deterministic authentication message for wallet signing
 */
export function generateAuthMessage(
  walletAddress: string,
  version: number = WALLET_AUTH_CONFIG.MESSAGE_VERSION
): string {
  return WALLET_AUTH_CONFIG.MESSAGE_TEMPLATE.replace(
    '{version}',
    version.toString()
  ).replace('{address}', walletAddress.toLowerCase());
}

/**
 * Derive encryption key and auth string from wallet signature
 *
 * Uses HKDF (HMAC-based Key Derivation Function) instead of PBKDF2 because
 * wallet signatures are already high-entropy cryptographic values from secp256k1.
 *
 * @param signature - Wallet signature (hex string with or without 0x prefix)
 * @returns Promise resolving to derived keys
 * @throws {CryptoError} If key derivation fails
 */
export async function deriveKeyFromWalletSignature(
  signature: string
): Promise<DerivedKeys> {
  try {
    const subtle = getSubtleCrypto();

    // Convert signature hex to ArrayBuffer (remove 0x prefix if present)
    const signatureHex = signature.startsWith('0x')
      ? signature.slice(2)
      : signature;
    const signatureBytes = hexToArrayBuffer(signatureHex);

    // Import signature as key material for HKDF
    const prk = await subtle.importKey(
      'raw',
      signatureBytes,
      'HKDF',
      false,
      ['deriveKey', 'deriveBits']
    );

    // Derive encryption key (K_enc) using HKDF
    const encryptionKey = await subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: WALLET_AUTH_CONFIG.FIXED_SALT,
        info: stringToArrayBuffer('encryption-key'),
      },
      prk,
      {
        name: CRYPTO_CONFIG.AES.ALGORITHM,
        length: CRYPTO_CONFIG.AES.KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );

    // Derive authentication string (H_auth) using HKDF
    const authBits = await subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: WALLET_AUTH_CONFIG.FIXED_SALT,
        info: stringToArrayBuffer('authentication-string'),
      },
      prk,
      256
    );

    const authString = arrayBufferToBase64(authBits);

    return {
      encryptionKey,
      authString,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new CryptoError(
        `Wallet key derivation failed: ${error.message}`,
        'WALLET_KEY_DERIVATION_ERROR'
      );
    }
    throw new CryptoError(
      'Wallet key derivation failed: Unknown error',
      'WALLET_KEY_DERIVATION_ERROR'
    );
  }
}
