/**
 * Cryptographic operation types
 */

export interface EncryptedData {
  ciphertext: string; // Base64-encoded
  iv: string; // Base64-encoded IV
}

export interface DerivedKeys {
  encryptionKey: CryptoKey; // K_enc
  authString: string; // H_auth as base64
}

export interface KeyDerivationParams {
  username: string;
  password: string;
  salt: ArrayBuffer;
}
