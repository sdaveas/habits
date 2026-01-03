/**
 * Safe access to Web Crypto API
 * 
 * Provides a centralized way to access the Web Crypto API with proper
 * error handling and context checks.
 */

import { CryptoError } from './CryptoError';

/**
 * Get the Web Crypto API, ensuring it's available in the current context
 * @returns The crypto object
 * @throws {CryptoError} If crypto API is not available
 */
export function getCrypto(): Crypto {
  // Check for window.crypto (browser)
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  
  // Check for global crypto (Node.js with webcrypto polyfill, or newer environments)
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  
  // Fallback to global crypto
  if (typeof crypto !== 'undefined') {
    return crypto;
  }
  
  throw new CryptoError(
    'Web Crypto API is not available. Ensure you are running in a secure context (HTTPS or localhost).',
    'CRYPTO_UNAVAILABLE'
  );
}

/**
 * Get the SubtleCrypto API, ensuring it's available
 * @returns The crypto.subtle object
 * @throws {CryptoError} If crypto.subtle is not available
 */
export function getSubtleCrypto(): SubtleCrypto {
  const crypto = getCrypto();
  
  if (!crypto.subtle) {
    throw new CryptoError(
      'Web Crypto API (crypto.subtle) is not available. This may be because:\n' +
      '1. You are not running in a secure context (HTTPS or localhost)\n' +
      '2. Your browser does not support the Web Crypto API\n' +
      '3. The page is being served over HTTP from a remote device',
      'SUBTLE_CRYPTO_UNAVAILABLE'
    );
  }
  
  return crypto.subtle;
}


