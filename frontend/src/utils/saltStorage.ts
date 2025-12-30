/**
 * Salt storage utility
 * 
 * NOTE: In production, salt should be stored server-side in the vault blob.
 * This is a temporary MVP solution for client-side salt storage.
 */

import { arrayBufferToBase64, base64ToArrayBuffer } from './arrayBufferUtils';

const SALT_STORAGE_PREFIX = 'habits_salt_';

/**
 * Store salt for a username (sessionStorage only - cleared on browser close)
 */
export function storeSalt(username: string, salt: ArrayBuffer): void {
  const key = `${SALT_STORAGE_PREFIX}${username}`;
  const base64Salt = arrayBufferToBase64(salt);
  sessionStorage.setItem(key, base64Salt);
}

/**
 * Get salt for a username
 */
export function getSalt(username: string): ArrayBuffer | null {
  const key = `${SALT_STORAGE_PREFIX}${username}`;
  const base64Salt = sessionStorage.getItem(key);
  if (!base64Salt) {
    return null;
  }
  return base64ToArrayBuffer(base64Salt);
}

/**
 * Clear salt for a username
 */
export function clearSalt(username: string): void {
  const key = `${SALT_STORAGE_PREFIX}${username}`;
  sessionStorage.removeItem(key);
}

