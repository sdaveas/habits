#!/bin/bash
# Start the backend server

cd "$(dirname "$0")"

echo "Starting Zero-Knowledge Habit Tracker Backend..."
echo "================================================"
echo ""
echo "Environment:"
echo "  Database: SQLite (habbits_dev.db)"
echo "  API Docs: http://localhost:8000/docs"
echo "  ReDoc: http://localhost:8000/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

pipenv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

