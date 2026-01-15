/**
 * IndexedDB storage keys
 */

export const STORAGE_KEYS = {
  DB_NAME: 'habits-vault',
  DB_VERSION: 2, // Increment version to add encryption key store
  STORES: {
    ENCRYPTED_BLOBS: 'encrypted-blobs',
    SYNC_QUEUE: 'sync-queue',
    ENCRYPTION_KEYS: 'encryption-keys', // Store for CryptoKey objects
  },
  LOCAL_STORAGE: {
    AUTH_TOKEN: 'habits-auth-token',
    USERNAME: 'habits-username',
    VAULT_ID: 'habits-vault-id',
    AUTH_TYPE: 'habits-auth-type',
  },
} as const;

