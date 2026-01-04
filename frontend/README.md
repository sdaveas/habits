# Habit Tracker Frontend

Zero-knowledge habit tracking application with GitHub-style heat map calendar visualization.

## Features

- **Zero-Knowledge Architecture**: All encryption happens client-side. Server never sees plaintext data or encryption keys.
- **Habit Management**: Create, edit, delete, and reorder habits with descriptions and colors.
- **Daily Tracking**: Mark habits as complete with optional comments. Only today and yesterday are editable (historical data is read-only).
- **Completion Comments**: Add optional comments to each habit completion for additional context.
- **Heat Map Calendar**: GitHub-style calendar visualization showing activity over the past year.
- **CSV Import/Export**: Export all habit data to CSV and import from CSV files.
- **Theme Toggle**: Switch between light and dark themes.
- **Automatic Sync**: Encrypted data automatically syncs to server after local changes.
- **Offline Support**: Works fully offline with IndexedDB caching.

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Cryptography**: Web Crypto API (PBKDF2, AES-256-GCM)

## Getting Started

### Prerequisites

- Node.js 20.19.0+ (or 22.12.0+)
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at:
- `https://localhost:5173` (HTTPS enabled for Web Crypto API support)
- `https://YOUR_IP:5173` (for network access)

**Note**: HTTPS is required for the Web Crypto API to work when accessing via IP address. Vite will auto-generate a self-signed certificate. Your browser will show a security warning - click "Advanced" and "Proceed to localhost" (or your IP) to continue.

### Building for Production

```bash
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── api/              # Fetch wrappers for backend communication
├── crypto/           # Pure cryptographic functions (no UI dependencies)
├── components/       # UI components (atomic design)
│   ├── atoms/        # Buttons, inputs, labels
│   ├── molecules/    # Form fields, search bars
│   ├── organisms/    # Login form, habit list, calendar
│   └── templates/    # Page layouts
├── store/            # Zustand state management (no keys stored)
├── utils/            # ArrayBuffer conversions, helpers
├── types/            # TypeScript interfaces and types
├── hooks/            # Custom React hooks
└── constants/        # API endpoints, config constants
```

## Security Considerations

- **Keys Never Persisted**: Encryption keys exist only in memory during the session
- **No Password Storage**: Passwords are never stored, only used for key derivation
- **Client-Side Encryption**: All data is encrypted before transmission
- **Secure Randomness**: All random values use `crypto.getRandomValues()`

## Development Notes

- All cryptographic operations are pure functions in the `/crypto` directory
- State management never stores encryption keys or passwords
- API layer is a thin wrapper around fetch with error handling
- Components follow atomic design principles

## License

See project root for license information.
