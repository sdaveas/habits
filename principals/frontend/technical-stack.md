# Frontend Technical Stack

See also: [Backend Technical Stack](../backend/technical-stack.md) | [Overview](../technical-stack.md)

## Language & Runtime

- **Language**: TypeScript (ES2022+)
- **Runtime**: Modern browsers with Web Crypto API support
- **Target Browsers**: 
  - Chrome/Edge 90+
  - Firefox 88+
  - Safari 14+
  - Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Framework

- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand

## Cryptography

- **API**: Web Crypto API (native browser API)
- **Key Derivation**: PBKDF2 via `crypto.subtle.deriveKey()`
- **Encryption**: AES-256-GCM via `crypto.subtle.encrypt()/decrypt()`
- **Random Generation**: `crypto.getRandomValues()`

## Build Tools

- **Build Tool**: Vite
- **Bundler**: Vite (Rollup-based)
- **Module System**: ES Modules

## Testing

- **Framework**: Vitest
- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **E2E Testing**: (To be determined - Playwright, Cypress, etc.)
- **Coverage**: Built into Vitest

## Code Quality

- **Linter**: ESLint
- **Formatter**: Prettier (via ESLint)
- **Type Checking**: TypeScript (strict mode)
- **Import Sorting**: ESLint plugin or Prettier

## Styling

- **CSS Framework**: Tailwind CSS
- **Theme Support**: Dark/light mode via theme store

## Package Management

- **Tool**: npm or pnpm (preferred for performance)
- **Lock File**: package-lock.json or pnpm-lock.yaml

## Development Tools

- **Dev Server**: (Provided by build tool)
- **Hot Module Replacement**: (Provided by build tool)
- **Browser DevTools**: Chrome DevTools, Firefox DevTools

## Storage

- **Offline Cache**: IndexedDB (for encrypted blob caching)
- **Session Storage**: Memory only (no persistent key storage)

## Browser APIs

- **Crypto**: Web Crypto API
- **Storage**: IndexedDB, SessionStorage (for non-sensitive data only)
- **Network**: Fetch API

