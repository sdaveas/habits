/**
 * Tests for key derivation
 */

import { describe, it, expect } from 'vitest';
import { deriveKey } from '../deriveKey';
import { generateSalt } from '../generateSalt';

describe('deriveKey', () => {
  it('should derive the same key from the same inputs', async () => {
    const salt = await generateSalt();
    const params = {
      username: 'testuser',
      password: 'testpassword',
      salt,
    };

    const key1 = await deriveKey(params);
    const key2 = await deriveKey(params);

    expect(key1.authString).toBe(key2.authString);
  });

  it('should derive different keys from different passwords', async () => {
    const salt = await generateSalt();
    const key1 = await deriveKey({
      username: 'testuser',
      password: 'password1',
      salt,
    });
    const key2 = await deriveKey({
      username: 'testuser',
      password: 'password2',
      salt,
    });

    expect(key1.authString).not.toBe(key2.authString);
  });

  it('should derive different keys from different salts', async () => {
    const salt1 = await generateSalt();
    const salt2 = await generateSalt();

    const key1 = await deriveKey({
      username: 'testuser',
      password: 'testpassword',
      salt: salt1,
    });
    const key2 = await deriveKey({
      username: 'testuser',
      password: 'testpassword',
      salt: salt2,
    });

    expect(key1.authString).not.toBe(key2.authString);
  });

  it('should return encryption key and auth string', async () => {
    const salt = await generateSalt();
    const keys = await deriveKey({
      username: 'testuser',
      password: 'testpassword',
      salt,
    });

    expect(keys.encryptionKey).toBeDefined();
    expect(keys.authString).toBeDefined();
    expect(typeof keys.authString).toBe('string');
    expect(keys.authString.length).toBeGreaterThan(0);
  });
});

