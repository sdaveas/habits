/**
 * Custom error class for cryptographic operations
 */

export class CryptoError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'CryptoError';
    Object.setPrototypeOf(this, CryptoError.prototype);
  }
}

