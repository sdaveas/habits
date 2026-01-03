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
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'unknown';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isHttp = protocol === 'http:';
    
    let errorMessage = 'Web Crypto API (crypto.subtle) is not available.\n\n';
    
    if (isHttp && !isLocalhost) {
      errorMessage += 'You are accessing the app over HTTP from a remote IP address.\n';
      errorMessage += 'The Web Crypto API requires HTTPS or localhost.\n\n';
      errorMessage += 'Solutions:\n';
      errorMessage += '1. Access via https://YOUR_IP:5173 (HTTPS is enabled in Vite config)\n';
      errorMessage += '2. Access via http://localhost:5173 (localhost works with HTTP)\n';
      errorMessage += '3. Accept the browser security warning for the self-signed certificate';
    } else if (isHttp) {
      errorMessage += 'You are accessing over HTTP. For remote access, use HTTPS.\n';
      errorMessage += 'Access via https://localhost:5173 or https://YOUR_IP:5173';
    } else {
      errorMessage += 'Possible causes:\n';
      errorMessage += '1. Your browser does not support the Web Crypto API\n';
      errorMessage += '2. The page is in an insecure context\n';
      errorMessage += '3. Browser security restrictions';
    }
    
    throw new CryptoError(errorMessage, 'SUBTLE_CRYPTO_UNAVAILABLE');
  }
  
  return crypto.subtle;
}


