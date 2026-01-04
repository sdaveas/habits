# Implementation Checklist

## Phase 1: The Handshake (Security Foundation)

### Frontend Tasks

- [x] Implement `deriveKey(password, salt)` using Web Crypto API
  - Use PBKDF2-HMAC-SHA256 with 600,000 iterations
  - Generate 32-byte (256-bit) key
  - Return `CryptoKey` object suitable for AES-256-GCM

- [x] Generate two outputs from key derivation:
  - $K_{enc}$ (Encryption Key) - for data encryption
  - $H_{auth}$ (Auth String) - for server authentication
  - Ensure keys are never persisted to storage

- [x] Implement secure password input component
  - Clear password from memory after use
  - No password logging or console output

### Backend Tasks

- [x] Implement FastAPI endpoint to receive $H_{auth}$
  - `POST /api/v1/auth/register` - Register new user
  - `POST /api/v1/auth/login` - Authenticate existing user

- [x] Implement Argon2id hashing for $H_{auth}$
  - Use recommended parameters (memory: 64MB, iterations: 3, parallelism: 4)
  - Store hash in database with user metadata

- [x] Implement authentication verification
  - Compare Argon2id hash on login
  - Return authentication token (JWT or session)

### Testing

- [x] Unit tests for key derivation
  - Verify same password + same salt = same key
  - Test with different passwords and salts
  - Verify key length and format

- [x] Unit tests for authentication
  - Test Argon2id hashing and verification
  - Test authentication endpoint responses

- [x] Integration tests
  - Test complete registration flow
  - Test complete login flow
  - Test authentication failure scenarios

## Phase 2: Storage (The Vault)

### Frontend Tasks

- [x] Implement `encrypt(plaintext, K_enc)` function
  - Use AES-256-GCM
  - Generate random 12-byte IV for each encryption
  - Return `{ciphertext, iv}` as base64 strings

- [x] Implement `decrypt(ciphertext, iv, K_enc)` function
  - Decrypt using AES-256-GCM
  - Verify authentication tag
  - Return plaintext string

- [x] Implement vault storage API client
  - `POST /api/v1/vault` - Store encrypted vault
  - `GET /api/v1/vault/{vault_id}` - Retrieve encrypted vault
  - Handle errors appropriately

- [x] Implement vault management UI
  - Create vault form
  - Display vault list
  - Edit/delete vault functionality

### Backend Tasks

- [x] Implement `POST /api/v1/vault` endpoint
  - Validate request schema (Pydantic model)
  - Verify user authentication
  - Store encrypted blob in database
  - Return vault metadata

- [x] Implement `GET /api/v1/vault/{vault_id}` endpoint
  - Verify user owns the vault
  - Return encrypted blob
  - Handle not found errors

- [x] Implement `PUT /api/v1/vault/{vault_id}` endpoint
  - Update existing vault
  - Verify ownership
  - Validate new data

- [x] Implement `DELETE /api/v1/vault/{vault_id}` endpoint
  - Verify ownership
  - Soft delete or hard delete (decide strategy)

- [x] Implement database models
  - Vault model with all required fields
  - User model (if not already created)
  - Relationships and indexes

### Testing

- [x] Unit tests for encryption/decryption
  - Test encryption round-trip
  - Test with different data sizes
  - Test error handling (invalid key, corrupted data)

- [x] API endpoint tests
  - Test all CRUD operations
  - Test authentication requirements
  - Test authorization (user can only access own vaults)
  - Test validation errors

- [x] Integration tests
  - Test complete vault creation flow
  - Test vault retrieval flow
  - Test concurrent access scenarios

## Phase 3: Habit Tracking Features

### Frontend Tasks

- [x] Implement habit data structure with HabitCompletion (includes optional comments)
- [x] Implement habit management (add, edit, delete, reorder)
- [x] Implement daily tracking with completion comments
- [x] Implement GitHub-style heat map calendar
- [x] Implement calendar click restrictions (only today/yesterday editable)
- [x] Implement theme toggle (light/dark mode)
- [x] Implement CSV import/export functionality
- [x] Implement automatic sync after local changes
- [x] Implement offline support with IndexedDB caching

### Backend Tasks

- [x] All backend tasks completed in Phase 1 and 2

## Phase 4: Testing & Validation

### Security Testing

- [x] Verify keys never leave client
  - Network inspection (no keys in requests)
  - Memory inspection (keys not in localStorage/cookies)
  - Code review for key leakage

- [x] Test authentication security
  - Test with invalid $H_{auth}$
  - Test with tampered authentication tokens
  - Test rate limiting on auth endpoints

- [x] Test encryption security
  - Verify same plaintext produces different ciphertext (due to unique IVs)
  - Test with corrupted ciphertext (should fail gracefully)
  - Test with wrong key (should fail gracefully)

### Performance Testing

- [x] Key derivation performance
  - Measure time for 600,000 iterations
  - Ensure acceptable user experience (< 2 seconds)

- [x] Encryption/decryption performance
  - Test with various data sizes
  - Measure throughput

- [x] API performance
  - Load testing for vault endpoints
  - Database query optimization
  - Response time targets (< 200ms for simple operations)

### Independent Development

- [x] Frontend mock server
  - Create `mock_crypto_server.js` for frontend development
  - Implement all API endpoints
  - Support offline development

- [x] Backend testing tools
  - cURL/Postman collection for API testing
  - Test scripts for common operations
  - Database seeding scripts

### Documentation

- [x] API documentation
  - OpenAPI/Swagger documentation (auto-generated by FastAPI)
  - Endpoint descriptions and examples
  - Error response documentation

- [x] Code documentation
  - README for setup and development
  - Architecture decision records (ADRs)
  - Security considerations document

- [x] User documentation
  - User guide for vault management
  - Security best practices for users

## Phase 5: Production Readiness

### Security Hardening

- [ ] Security headers configuration
- [ ] TLS 1.3 enforcement
- [ ] Rate limiting implementation
- [ ] Input sanitization review
- [ ] Dependency vulnerability scanning

### Monitoring & Observability

- [ ] Logging implementation
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Health check endpoints

### Deployment

- [ ] CI/CD pipeline setup
- [ ] Database migration strategy
- [ ] Backup and recovery procedures
- [ ] Rollback procedures
