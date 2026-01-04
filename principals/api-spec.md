# API Specification

## Communication Protocol

- **Protocol**: REST API over HTTPS
- **TLS Version**: TLS 1.3 (minimum)
- **Content-Type**: `application/json`
- **Authentication**: Bearer token (JWT)

## Data Exchange Format (The "Blob")

All data sent to the Python backend for storage must follow this JSON schema. This format is used to store encrypted habit data (see [Product Specification](./product-spec.md) for the plaintext `HabitData` structure that gets encrypted into this format):

```json
{
  "vault_id": "uuid-v4",
  "ciphertext": "base64-encoded-string",
  "iv": "base16-or-64-string",
  "salt": "user-unique-salt",
  "version": 1
}
```

### Field Specifications

- **vault_id**: UUID v4 identifier for the vault entry
- **ciphertext**: Base64-encoded encrypted data
- **iv**: Initialization vector in base16 (hex) or base64 format
- **salt**: User-unique salt used for key derivation (base64-encoded)
- **version**: Schema version number (for future compatibility)

## Error Response Format

All error responses should follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## API Endpoints (Overview)

All endpoints are versioned under `/api/v1/`:

- **Authentication**:
  - `POST /api/v1/auth/register` - Register new user
  - `POST /api/v1/auth/login` - Authenticate existing user

- **Vault Management**:
  - `POST /api/v1/vault` - Store encrypted vault
  - `GET /api/v1/vault/{vault_id}` - Retrieve encrypted vault
  - `PUT /api/v1/vault/{vault_id}` - Update encrypted vault
  - `DELETE /api/v1/vault/{vault_id}` - Delete encrypted vault

See [Backend Architecture](./backend/architecture.md) for detailed endpoint specifications and implementation details.
