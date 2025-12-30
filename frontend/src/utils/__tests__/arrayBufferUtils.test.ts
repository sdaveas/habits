/**
 * Tests for ArrayBuffer utilities
 */

import { describe, it, expect } from 'vitest';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  arrayBufferToHex,
  hexToArrayBuffer,
  stringToArrayBuffer,
  arrayBufferToString,
} from '../arrayBufferUtils';

describe('arrayBufferUtils', () => {
  it('should convert ArrayBuffer to base64 and back', () => {
    const original = new Uint8Array([72, 101, 108, 108, 111]).buffer;
    const base64 = arrayBufferToBase64(original);
    const converted = base64ToArrayBuffer(base64);

    expect(new Uint8Array(converted)).toEqual(new Uint8Array(original));
  });

  it('should convert ArrayBuffer to hex and back', () => {
    const original = new Uint8Array([72, 101, 108, 108, 111]).buffer;
    const hex = arrayBufferToHex(original);
    const converted = hexToArrayBuffer(hex);

    expect(new Uint8Array(converted)).toEqual(new Uint8Array(original));
  });

  it('should convert string to ArrayBuffer and back', () => {
    const original = 'Hello, World!';
    const buffer = stringToArrayBuffer(original);
    const converted = arrayBufferToString(buffer);

    expect(converted).toBe(original);
  });
});

