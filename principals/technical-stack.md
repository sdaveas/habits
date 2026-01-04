# Technical Stack

This document provides an overview of the technology stack. For detailed information, see the platform-specific documentation:

- **[Backend Technical Stack](./backend/technical-stack.md)** - Python, FastAPI, SQLite/PostgreSQL
- **[Frontend Technical Stack](./frontend/technical-stack.md)** - TypeScript, Web Crypto API

For product requirements and features, see the [Product Specification](./product-spec.md).

## Overview

### Backend
- Python 3.11+ with FastAPI
- SQLite (default) or PostgreSQL database
- SQLModel ORM (async SQLAlchemy)
- Alembic for migrations
- pipenv for dependency management

### Frontend
- TypeScript (ES2022+) with React 18+
- Modern browsers with Web Crypto API support
- Vite build tool
- Zustand for state management
- Tailwind CSS for styling

## Communication

- **Protocol**: REST API
- **Security**: TLS 1.3
- **Data Format**: JSON

## Shared Development Tools

- **Version Control**: Git
- **CI/CD**: (To be determined)
