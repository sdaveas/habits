"""Script to flush/clear all data from the database.

WARNING: This will permanently delete all users and vaults from the database.
Use only for development/testing purposes.
"""

import asyncio
import sys
from pathlib import Path

from sqlalchemy import text
from sqlmodel import SQLModel

from app.core.database import engine, init_db
from app.models.database import User, Vault


async def flush_database() -> None:
    """Delete all data from the database."""
    print("Flushing database...")

    async with engine.begin() as conn:
        # Delete all vaults first (due to foreign key constraint)
        await conn.execute(text("DELETE FROM vault"))
        print("✓ Deleted all vaults")

        # Delete all users
        await conn.execute(text("DELETE FROM user"))
        print("✓ Deleted all users")

    print("\n✅ Database flushed successfully!")


async def recreate_database() -> None:
    """Drop all tables and recreate them."""
    print("Recreating database schema...")

    async with engine.begin() as conn:
        # Drop all tables
        await conn.run_sync(SQLModel.metadata.drop_all)
        print("✓ Dropped all tables")

    # Recreate tables
    await init_db()
    print("✓ Recreated all tables")
    print("\n✅ Database recreated successfully!")


async def delete_database_file() -> None:
    """Delete the SQLite database file (if using SQLite)."""
    from app.core.config import settings

    if not settings.database_url.startswith("sqlite"):
        print("⚠️  Not using SQLite. Cannot delete database file.")
        return

    # Extract file path from SQLite URL
    # Format: sqlite+aiosqlite:///path/to/file.db or sqlite+aiosqlite:///./file.db
    db_path = settings.database_url.replace("sqlite+aiosqlite:///", "")

    # Skip if in-memory database
    if db_path == ":memory:":
        print("⚠️  Using in-memory database. Nothing to delete.")
        return

    # Handle relative paths (common in SQLite URLs)
    if db_path.startswith("./"):
        db_path = db_path[2:]
    elif not db_path.startswith("/"):
        # Relative path without ./
        db_path = db_path

    db_file = Path(db_path)
    if not db_file.is_absolute():
        # Make path relative to backend directory
        backend_dir = Path(__file__).parent
        db_file = backend_dir / db_file

    if db_file.exists():
        db_file.unlink()
        print(f"✓ Deleted database file: {db_file}")
        print("\n✅ Database file deleted! It will be recreated on next startup.")
    else:
        print(f"⚠️  Database file not found: {db_file}")
        print(f"   Looking for: {db_file.absolute()}")


async def main() -> None:
    """Main function."""
    if len(sys.argv) > 1 and sys.argv[1] == "--recreate":
        await recreate_database()
    elif len(sys.argv) > 1 and sys.argv[1] == "--delete-file":
        await delete_database_file()
    else:
        await flush_database()


if __name__ == "__main__":
    asyncio.run(main())

