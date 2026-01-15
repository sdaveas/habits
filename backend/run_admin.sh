#!/bin/bash
# Run the admin interface

cd "$(dirname "$0")"

echo "Starting Admin Interface..."
echo "=========================="
echo ""
echo "The admin panel will open in your browser at:"
echo "  http://localhost:8501"
echo ""
echo "Press Ctrl+C to stop"
echo ""

pipenv run streamlit run admin.py --server.port 8501


