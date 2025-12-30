# Cryptographic Specification

## Overview

This document defines the cryptographic standards for the Zero-Knowledge Habit Tracker. All implementations must strictly adhere to these specifications.

## Key Derivation

| Component | Specification |
|-----------|--------------|
| Primary KDF | PBKDF2-HMAC-SHA256 |
| Iterations | 600,000 (minimum) |
| Salt Length | 32 bytes (256 bits) |
| Key Length | 32 bytes (256 bits) for AES-256 |
| Key Source | `username + password + salt` (concatenated before PBKDF2) |

**Note**: The encryption key is derived from the concatenation of username, password, and a randomly generated salt. This ensures unique keys even when usernames are not unique across the system.

## Encryption

| Component | Specification |
|-----------|--------------|
| Algorithm | AES-256-GCM (Authenticated Encryption) |
| IV Length | 12 bytes (96 bits) for GCM |
| Tag Length | 16 bytes (128 bits) |
| Nonce | Randomly generated per encryption operation |

## Authentication Hashing

| Component | Specification |
|-----------|--------------|
| Client-side | PBKDF2-HMAC-SHA256 (600,000 iterations) |
| Server-side | Argon2id (memory: 64MB, iterations: 3, parallelism: 4) |
| Purpose | Verify password without storing plaintext or encryption key |

## Key Storage & Security

- **Memory Only**: Never persist the derived key to LocalStorage, Cookies, or any persistent storage.
- **Key Lifecycle**: Keys are generated on-demand and cleared from memory after use.
- **No Key Transmission**: Encryption keys never leave the client environment.
- **Secure Memory**: Use secure memory allocation where available (e.g., `crypto.getRandomValues()` for randomness).

## Security Requirements

1. **Forward Secrecy**: Each encryption operation uses a unique IV/nonce.
2. **Authenticated Encryption**: Always use AES-GCM to ensure data integrity.
3. **Constant-Time Operations**: Use constant-time comparisons for authentication.
4. **Secure Randomness**: All random values must use cryptographically secure RNG.
