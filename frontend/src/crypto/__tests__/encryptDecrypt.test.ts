/**
 * Tests for encryption and decryption
 */

import { describe, it, expect } from 'vitest';
import { encrypt } from '../encrypt';
import { decrypt } from '../decrypt';
import { deriveKey } from '../deriveKey';
import { generateSalt } from '../generateSalt';

describe('encrypt and decrypt', () => {
  it('should encrypt and decrypt data correctly', async () => {
    const salt = await generateSalt();
    const { encryptionKey } = await deriveKey({
      username: 'testuser',
      password: 'testpassword',
      salt,
    });

    const plaintext = 'Hello, World!';
    const encrypted = await encrypt(plaintext, encryptionKey);
    const decrypted = await decrypt(encrypted, encryptionKey);

    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertext for same plaintext (unique IVs)', async () => {
    const salt = await generateSalt();
    const { encryptionKey } = await deriveKey({
      username: 'testuser',
      password: 'testpassword',
      salt,
    });

    const plaintext = 'Hello, World!';
    const encrypted1 = await encrypt(plaintext, encryptionKey);
    const encrypted2 = await encrypt(plaintext, encryptionKey);

    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
  });

  it('should fail to decrypt with wrong key', async () => {
    const salt1 = await generateSalt();
    const salt2 = await generateSalt();

    const { encryptionKey: key1 } = await deriveKey({
      username: 'testuser',
      password: 'testpassword',
      salt: salt1,
    });
    const { encryptionKey: key2 } = await deriveKey({
      username: 'testuser',
      password: 'differentpassword',
      salt: salt2,
    });

    const plaintext = 'Hello, World!';
    const encrypted = await encrypt(plaintext, key1);

    await expect(decrypt(encrypted, key2)).rejects.toThrow();
  });
});

