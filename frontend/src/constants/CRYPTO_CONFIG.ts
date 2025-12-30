/**
 * Cryptographic configuration constants
 */

export const CRYPTO_CONFIG = {
  PBKDF2: {
    ITERATIONS: 600_000,
    HASH: 'SHA-256',
    KEY_LENGTH: 256, // bits (32 bytes)
  },
  AES: {
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256, // bits
    IV_LENGTH: 12, // bytes (96 bits for GCM)
    TAG_LENGTH: 128, // bits
  },
  SALT_LENGTH: 32, // bytes
} as const;

