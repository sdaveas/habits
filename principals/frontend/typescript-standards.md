# TypeScript Standards & Best Practices

## TypeScript Configuration

### Strict Mode

Enable all strict type checking options:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Additional Recommended Settings

- `"noUnusedLocals": true` - Error on unused local variables
- `"noUnusedParameters": true` - Error on unused parameters
- `"noImplicitReturns": true` - Ensure all code paths return a value
- `"noFallthroughCasesInSwitch": true` - Prevent switch fallthrough
- `"esModuleInterop": true` - Enable ES module interop
- `"skipLibCheck": true` - Skip type checking of declaration files

## Type Safety Principles

### 1. Avoid `any` Type

- **Never use `any`**: Use `unknown` if the type is truly unknown
- **Type assertions**: Prefer type guards over type assertions
- **Gradual typing**: Use `@ts-expect-error` or `@ts-ignore` only when absolutely necessary, with comments explaining why

### 2. Use Discriminated Unions

For state management and API responses:

```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

### 3. Prefer Interfaces for Object Shapes

Use interfaces for object types that might be extended:

```typescript
interface VaultBlob {
  vault_id: string;
  ciphertext: string;
  iv: string;
  salt: string;
  version: number;
}
```

### 4. Use Type Aliases for Unions and Intersections

```typescript
type UUID = string;
type Base64String = string;
```

## Code Organization

### 1. Function Signatures

- **Explicit return types**: Always specify return types for exported functions
- **Parameter types**: Never rely on type inference for function parameters
- **Async functions**: Always return `Promise<T>`, not just `T`

```typescript
async function encryptData(
  plaintext: string,
  key: CryptoKey
): Promise<EncryptedData> {
  // ...
}
```

### 2. Error Handling

- **Custom error types**: Create specific error classes for different error scenarios
- **Result types**: Consider using Result types instead of throwing exceptions

```typescript
class CryptoError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'CryptoError';
  }
}
```

### 3. Null Safety

- **Optional chaining**: Use `?.` for safe property access
- **Nullish coalescing**: Use `??` for default values
- **Non-null assertions**: Avoid `!` operator; use type guards instead

## Async/Await Best Practices

### 1. Always Handle Errors

```typescript
// Good
try {
  const result = await asyncOperation();
  return result;
} catch (error) {
  // Handle error appropriately
  throw new CryptoError('Operation failed', 'OPERATION_ERROR');
}

// Bad
const result = await asyncOperation(); // Unhandled promise rejection
```

### 2. Use Promise.all for Parallel Operations

```typescript
const [key, salt] = await Promise.all([
  deriveKey(password, salt),
  generateSalt()
]);
```

## Web Crypto API Types

### Type Definitions

```typescript
// Define types for Web Crypto API usage
type AlgorithmIdentifier = AlgorithmIdentifier | KeyAlgorithm;
type CryptoKeyUsage = 'encrypt' | 'decrypt' | 'deriveKey' | 'deriveBits';

interface DeriveKeyParams {
  name: string;
  salt: ArrayBuffer;
  iterations: number;
  hash: string;
  length: number;
}
```

## Testing Types

### Mock Types

```typescript
// Use Partial<T> for test mocks
const mockVault: Partial<VaultBlob> = {
  vault_id: 'test-id',
  version: 1
};
```

## Documentation

### JSDoc Comments

Use JSDoc for public APIs:

```typescript
/**
 * Derives an encryption key from a password and salt using PBKDF2.
 * 
 * @param password - The user's password (will be cleared from memory after use)
 * @param salt - The salt value (32 bytes)
 * @returns A Promise resolving to a CryptoKey suitable for AES-256-GCM encryption
 * @throws {CryptoError} If key derivation fails
 */
async function deriveKey(
  password: string,
  salt: ArrayBuffer
): Promise<CryptoKey> {
  // ...
}
```

## Code Quality Tools

- **ESLint**: Use TypeScript-aware rules
- **Prettier**: Consistent code formatting
- **Type Coverage**: Aim for 100% type coverage
- **Strict linting**: Enable all recommended TypeScript ESLint rules

