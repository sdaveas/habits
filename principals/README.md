# Project Principles & Standards

This directory contains the engineering principles, standards, and best practices for the Zero-Knowledge Habit Tracker project.

## Structure

### Product Specification

- **[Product Specification](./product-spec.md)** - Complete product overview, features, user flows, and requirements

### Common Principles (Root)

These documents apply to both frontend and backend:

- **[Engineering Principles](./engineering-principles.md)** - Core architectural mandate and general coding standards
- **[Cryptographic Specification](./cryptographic-spec.md)** - Shared cryptographic standards and security requirements
- **[API Specification](./api-spec.md)** - Data exchange format and API contract
- **[Technical Stack](./technical-stack.md)** - Technology choices and tools
- **[Implementation Checklist](./implementation-checklist.md)** - Phased implementation guide

### Frontend-Specific

Located in `frontend/`:

- **[Project Structure](./frontend/project-structure.md)** - Frontend directory layout and organization
- **[TypeScript Standards](./frontend/typescript-standards.md)** - TypeScript best practices, type safety, and code quality
- **[Architecture](./frontend/architecture.md)** - Frontend architecture patterns and security considerations
- **[Technical Stack](./frontend/technical-stack.md)** - Frontend technology choices and tools

### Backend-Specific

Located in `backend/`:

- **[Project Structure](./backend/project-structure.md)** - Backend directory layout and organization
- **[Python Standards](./backend/python-standards.md)** - Python best practices, type hints, and FastAPI patterns
- **[Architecture](./backend/architecture.md)** - Backend architecture patterns, security, and deployment
- **[Technical Stack](./backend/technical-stack.md)** - Backend technology choices and tools

## Quick Start

1. **New to the project?** Start with [Product Specification](./product-spec.md) to understand what we're building
2. **Understanding architecture?** Read [Engineering Principles](./engineering-principles.md) for core concepts
3. **Frontend developer?** Read the [Frontend Architecture](./frontend/architecture.md) and [TypeScript Standards](./frontend/typescript-standards.md)
4. **Backend developer?** Read the [Backend Architecture](./backend/architecture.md) and [Python Standards](./backend/python-standards.md)
5. **Implementing features?** Follow the [Implementation Checklist](./implementation-checklist.md)

## Core Principles

- **Zero-Knowledge Architecture**: Server never sees plaintext or encryption keys
- **Strong Separation**: Frontend and backend can be developed and tested independently
- **Security First**: All cryptographic operations happen client-side
- **Type Safety**: Strict typing in both TypeScript and Python
- **Best Practices**: Follow language-specific best practices and conventions

