# Frontend Project Structure

## Directory Layout

Maintain a flat hierarchy to prevent "Folder-in-Folder" fatigue:

```
src/
  /api          # Fetch wrappers for communication with Python
  /crypto       # PURE functions for encrypt/decrypt/derive (Independent of UI)
  /components   # UI elements (Atomic design: atoms, molecules, organisms)
  /store        # Application state (No keys stored here)
  /utils        # Text-to-ArrayBuffer conversions and helpers
  /types        # TypeScript type definitions and interfaces
  /hooks        # Custom React hooks (if using React)
  /constants    # Application constants
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `VaultManager.tsx`)
- **Utilities**: camelCase (e.g., `arrayBufferUtils.ts`)
- **Types**: PascalCase (e.g., `VaultTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

## Module Organization

- **One export per file** for main exports (preferred)
- **Index files** for re-exports when needed
- **Barrel exports** should be used sparingly to avoid circular dependencies

