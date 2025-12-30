# Engineering Principles

## Architectural Mandate

The application must adhere to a **Zero-Knowledge Architecture**. 

- The server (Python) is a "Blind Vault" that stores encrypted blobs.
- The client (Browser/JS) is the "Secure Environment" where all cryptographic keys are generated and used.
- **Never trust, always verify**: The server never sees plaintext data or encryption keys.

## General Coding Standards

### Code Quality

- **Flat Code Path**: Use Guard Clauses. Avoid nested if/else blocks.
- **Early Returns**: Return early to reduce cognitive load and improve readability.
- **Single Responsibility**: Each function/class should do one thing well.
- **DRY Principle**: Don't Repeat Yourself, but don't over-abstract either.

### Separation of Concerns

- **Strong Separation**: 
  - The Frontend must be able to run against a mock server.
  - The Backend must be testable via cURL/Postman without a browser.
- **Dependency Inversion**: Depend on abstractions, not concrete implementations.
- **Clear Boundaries**: Define explicit contracts between frontend and backend.

### Documentation

- **Focus on Context and Security Boundaries**: Document why, not what.
- **No comments for obvious logic**: Code should be self-documenting.
- **Security-critical paths**: Always document cryptographic operations and key handling.
- **API Contracts**: Document all API endpoints with request/response schemas.

### Testing Philosophy

- **Test Independence**: Each test should be able to run in isolation.
- **Test Security Boundaries**: Verify that keys never leave the client.
- **Negative Testing**: Test failure paths and edge cases.
- **Integration Testing**: Verify end-to-end flows without breaking separation.
