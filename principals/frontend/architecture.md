# Frontend Architecture

## Core Principles

### 1. Zero-Knowledge Client

The frontend is the **Secure Environment** where all cryptographic operations occur:

- **Key Generation**: All encryption keys are generated client-side
- **Key Storage**: Keys exist only in memory, never persisted
- **Encryption/Decryption**: All data encryption happens before transmission
- **No Trust**: The frontend never trusts the backend with plaintext data

### 2. Pure Functions for Crypto

All cryptographic functions must be **pure** and **independent of UI**:

```typescript
// ✅ Good: Pure function, no side effects
export async function encrypt(
  plaintext: string,
  key: CryptoKey,
  iv: Uint8Array
): Promise<EncryptedData> {
  // Pure encryption logic
}

// ❌ Bad: Depends on UI state
export async function encryptWithState(
  plaintext: string,
  state: AppState
): Promise<EncryptedData> {
  // Violates separation of concerns
}
```

### 3. State Management

- **No Keys in State**: Application state (Redux, Zustand, etc.) must never store encryption keys
- **Ephemeral Keys**: Keys should be scoped to the operation, not global state
- **Secure State**: Sensitive data (like passwords) should be cleared immediately after use

### 4. API Layer

The API layer is a **thin wrapper** around fetch:

- **No Business Logic**: API functions only handle HTTP communication
- **Type Safety**: All API calls should be fully typed
- **Error Handling**: Consistent error handling and transformation

```typescript
// API layer example
export async function storeVault(blob: VaultBlob): Promise<void> {
  const response = await fetch('/api/v1/vault', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blob)
  });
  
  if (!response.ok) {
    throw new APIError('Failed to store vault', response.status);
  }
}
```

## Component Architecture

### Atomic Design

Organize components using atomic design principles:

- **Atoms**: Basic building blocks (buttons, inputs, labels)
- **Molecules**: Simple combinations (form fields, search bars)
- **Organisms**: Complex UI sections (vault manager, login form)
- **Templates**: Page layouts
- **Pages**: Full page components

### Component Guidelines

1. **Single Responsibility**: Each component should have one clear purpose
2. **Props Interface**: Define explicit prop types, avoid `any`
3. **Composition over Inheritance**: Prefer composition patterns
4. **Controlled Components**: Use controlled components for forms

## Security Considerations

### 1. Memory Management

- **Clear Sensitive Data**: Explicitly clear passwords and keys from memory when possible
- **No Console Logging**: Never log sensitive data to console
- **Secure Randomness**: Always use `crypto.getRandomValues()` for random data

### 2. XSS Prevention

- **Sanitize Input**: Sanitize all user input before rendering
- **Content Security Policy**: Implement strict CSP headers
- **No eval()**: Never use `eval()` or similar dangerous functions

### 3. Network Security

- **HTTPS Only**: All API calls must use HTTPS
- **Certificate Pinning**: Consider certificate pinning for production
- **No Mixed Content**: Ensure all resources are loaded over HTTPS

## Testing Strategy

### 1. Unit Tests

- **Crypto Functions**: Test all cryptographic functions in isolation
- **Pure Functions**: Test pure utility functions
- **Type Safety**: Use TypeScript to catch type errors at compile time

### 2. Integration Tests

- **Mock Server**: Use a mock server for API integration tests
- **Crypto Verification**: Test that encryption/decryption round-trips work correctly
- **Error Scenarios**: Test error handling and edge cases

### 3. E2E Tests

- **User Flows**: Test complete user workflows
- **Security Flows**: Verify that keys never leave the client
- **Browser Compatibility**: Test across supported browsers

## Build & Deployment

### 1. Build Configuration

- **Tree Shaking**: Enable tree shaking to reduce bundle size
- **Code Splitting**: Implement code splitting for better performance
- **Source Maps**: Generate source maps for debugging (exclude in production)

### 2. Security Headers

Ensure the application serves with appropriate security headers:

- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

