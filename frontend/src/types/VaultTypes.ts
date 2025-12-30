/**
 * Vault blob structure for encrypted data storage
 */

export interface VaultBlob {
  vault_id: string; // UUID v4
  ciphertext: string; // Base64-encoded encrypted data
  iv: string; // Base16 (hex) or base64 string
  salt: string; // User-unique salt (base64-encoded)
  version: number; // Schema version
}

