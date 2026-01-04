# Product Specification: Habit Tracker

## Overview

A zero-knowledge habit tracking application that allows users to track multiple habits using a GitHub-style heat map calendar visualization. All habit data is encrypted locally and never leaves the device in unencrypted form. Users can sync their encrypted data across devices via a server, but the server never has access to plaintext data or encryption keys.

## Core Features

### 1. Habit Management

- **Add Habits**: Users can create multiple habits to track
- **Edit Habits**: Users can modify habit names and details
- **Delete Habits**: Users can remove habits they no longer want to track
- **Habit Metadata**: Each habit can have:
  - Name (required)
  - Optional description
  - Color/theme for visual distinction
  - Creation date

### 2. Daily Tracking

- **Mark as Done**: Users can click "Done Today" to mark a habit as completed for the current day
- **Visual Feedback**: Completed days are highlighted on the calendar heat map
- **Completion Comments**: Users can add optional comments to each completion
- **Edit Restrictions**: Users can only edit completions for today and yesterday (historical data is read-only)
- **Undo**: Users can undo a completion if marked by mistake

### 3. Visual Calendar (GitHub Heat Map Style)

- **Heat Map Display**: Calendar grid showing activity over time
  - Each cell represents a day
  - Color intensity indicates activity level (number of habits completed)
  - Hover/tooltip shows date and completion details
- **Time Range**: Default view shows last year, with option to view different ranges
- **Responsive Design**: Calendar adapts to different screen sizes
- **Accessibility**: Color-blind friendly color schemes

### 4. Data Synchronization

- **Encrypted Sync**: All data is encrypted before transmission to server
- **Automatic Sync**: Changes are automatically encrypted and synced after local modifications
- **Conflict Resolution**: Handle sync conflicts (last-write-wins or manual merge)
- **Offline Support**: Application works offline, syncs when connection is available

### 5. Data Import/Export

- **CSV Export**: Users can export all habit data to CSV format
- **CSV Import**: Users can import habit data from CSV files
- **Format Support**: CSV includes habit metadata, completion dates, and comments
- **Data Migration**: Supports importing data from previous exports

### 6. User Interface

- **Theme Toggle**: Users can switch between light and dark themes
- **Habit Reordering**: Users can reorder habits via drag-and-drop or manual ordering
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## User Authentication & Key Derivation

### Authentication Model

- **Username**: Not required to be unique across the system
- **Password**: Required for encryption key derivation
- **Key Derivation**: Encryption key is derived from `username + password + entropy`
  - This ensures that even if usernames collide, encryption keys are unique
  - Same username + different password = different encrypted data
  - Different username + same password = different encrypted data

### Authentication Flow

1. User enters username and password
2. Frontend derives encryption key using: `PBKDF2(username + password + salt, iterations=600,000)`
3. Frontend derives authentication hash: `PBKDF2(username + password + salt, iterations=600,000)` → `H_auth`
4. Frontend sends `H_auth` to server (never sends password or encryption key)
5. Server stores/verifies `H_auth` using Argon2id
6. Server returns authentication token
7. Frontend uses encryption key to decrypt local data or fetch encrypted blob from server

## Data Model

### Habit Data Structure

```typescript
interface HabitCompletion {
  date: string;           // ISO 8601 date (YYYY-MM-DD)
  comment?: string;        // Optional comment for this completion
}

interface Habit {
  id: string;              // UUID v4
  name: string;
  description?: string;
  color?: string;         // Hex color code
  createdAt: string;      // ISO 8601 timestamp
  completedDates: HabitCompletion[]; // Array of completion records with optional comments
}

interface HabitData {
  habits: Habit[];
  lastModified: string;    // ISO 8601 timestamp
  version: number;         // Schema version for future migrations
}
```

### Encrypted Blob Format

The entire `HabitData` object is encrypted and stored as:

```json
{
  "vault_id": "uuid-v4",
  "ciphertext": "base64-encoded-encrypted-HabitData",
  "iv": "base16-or-64-string",
  "salt": "user-unique-salt",
  "version": 1
}
```

## User Flows

### 1. First-Time User Registration

1. User opens application
2. User enters desired username and password
3. Frontend derives encryption key and authentication hash
4. Frontend creates empty habit data structure
5. Frontend encrypts empty data structure
6. Frontend sends authentication hash to server for registration
7. Frontend sends encrypted blob to server for storage
8. User is logged in and can start adding habits

### 2. Returning User Login

1. User enters username and password
2. Frontend derives encryption key and authentication hash
3. Frontend sends authentication hash to server
4. Server verifies authentication hash
5. Server returns encrypted blob
6. Frontend decrypts blob using encryption key
7. Frontend displays habits and calendar

### 3. Adding a Habit

1. User clicks "Add Habit" button
2. User enters habit name (and optional description/color)
3. Frontend adds habit to local `HabitData` structure
4. Frontend encrypts updated `HabitData`
5. Frontend automatically syncs encrypted blob to server
6. UI updates to show new habit in calendar

### 4. Marking Habit as Done

1. User clicks "Done Today" button for a habit (or clicks calendar cell for today/yesterday)
2. User optionally adds a comment for the completion
3. Frontend adds current date (with optional comment) to habit's `completedDates` array
4. Frontend updates local `HabitData` structure
5. Frontend encrypts updated `HabitData`
6. Frontend automatically syncs encrypted blob to server
7. Calendar heat map updates to show completion

### 5. Viewing Calendar

1. User navigates to calendar view
2. Frontend reads decrypted `HabitData` from memory
3. Frontend calculates heat map intensity for each day
4. Frontend renders calendar grid with appropriate colors
5. User can hover over cells to see details

## Security Requirements

### Encryption

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2-HMAC-SHA256 (600,000 iterations)
- **Key Source**: `username + password + salt`
- **IV Generation**: Unique 12-byte IV for each encryption operation
- **Key Storage**: Never persisted, only in memory during session

### Data Privacy

- **Zero-Knowledge**: Server never sees plaintext habit data
- **No Key Transmission**: Encryption keys never leave the client
- **Encrypted Storage**: All server storage is encrypted blobs only
- **Local-First**: Application works fully offline without server

### Authentication

- **No Password Storage**: Server never stores passwords
- **Hash-Based Auth**: Server only stores Argon2id hash of authentication string
- **Session Management**: Use secure tokens (JWT or session-based)
- **Rate Limiting**: Protect authentication endpoints from brute force

## UI/UX Specifications

### Visual Design

- **GitHub Heat Map Style**: 
  - Grid layout with cells representing days
  - Color gradient from light (no activity) to dark (high activity)
  - Default: 4-5 intensity levels
  - Responsive cell sizing
- **Color Scheme**: 
  - Support for multiple color themes
  - Accessibility: Color-blind friendly palettes
  - Dark mode support
- **Typography**: Clear, readable fonts with appropriate sizing

### Layout

- **Header**: 
  - Username display
  - Logout button
  - Sync status indicator
- **Sidebar/Navigation**:
  - List of habits
  - "Add Habit" button
  - Filter/search habits
- **Main Content**:
  - Calendar heat map (primary view)
  - Habit detail view (optional)
  - Statistics/insights (optional)

### Interactions

- **Hover States**: Show date and completion details on calendar cells
- **Click Actions**: 
  - Calendar cell: Toggle completion for today/yesterday (historical dates are read-only)
  - Habit item: Show/edit habit details
  - Completion cell: Add/edit comment for that completion
- **Keyboard Shortcuts**: 
  - Quick add habit
  - Mark today as done
  - Navigate calendar
- **Theme Toggle**: Switch between light and dark themes
- **Habit Reordering**: Drag-and-drop or manual reordering of habits

### Responsive Design

- **Mobile**: Stack layout, touch-friendly controls
- **Tablet**: Optimized grid layout
- **Desktop**: Full calendar view with sidebar

## Technical Requirements

### Frontend

- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand for local state with encrypted sync
- **Styling**: Tailwind CSS
- **Crypto**: Web Crypto API (PBKDF2, AES-256-GCM)
- **Storage**: IndexedDB for offline encrypted blob cache
- **Build**: Vite
- **Testing**: Vitest + React Testing Library

### Backend

- **Framework**: FastAPI (Python 3.11+)
- **API**: REST API (see [API Specification](./api-spec.md))
- **Storage**: SQLite (default) or PostgreSQL for encrypted blobs
- **Database ORM**: SQLModel (async SQLAlchemy)
- **Authentication**: JWT tokens with Argon2id password hashing
- **Migrations**: Alembic
- **Sync**: Last-write-wins or version-based conflict resolution

### Performance

- **Encryption Speed**: Key derivation should complete in < 2 seconds
- **Sync Speed**: Encrypted blob sync should complete in < 1 second
- **Calendar Rendering**: Smooth rendering for 365+ days of data
- **Offline Performance**: Full functionality without network

## Future Enhancements (Out of Scope for MVP)

- Habit streaks and statistics
- Habit categories/tags
- Sharing habits (encrypted sharing)
- Mobile apps (iOS/Android)
- Habit reminders/notifications
- Custom date ranges and views
- Habit templates
- Social features (encrypted sharing)

## Implemented Features (Beyond MVP)

- ✅ CSV Import/Export functionality
- ✅ Completion comments
- ✅ Theme toggle (light/dark mode)
- ✅ Habit reordering
- ✅ Calendar click restrictions (only today/yesterday editable)

## Success Metrics

- **User Engagement**: Daily active users
- **Data Security**: Zero data breaches (server never sees plaintext)
- **Performance**: < 2s key derivation, < 1s sync
- **Reliability**: 99.9% uptime for sync service
- **User Satisfaction**: Positive feedback on security and usability

## References

- [Engineering Principles](./engineering-principles.md)
- [Cryptographic Specification](./cryptographic-spec.md)
- [API Specification](./api-spec.md)
- [Technical Stack](./technical-stack.md)
- [Frontend Architecture](./frontend/architecture.md)
- [Backend Architecture](./backend/architecture.md)
- [Implementation Checklist](./implementation-checklist.md)

