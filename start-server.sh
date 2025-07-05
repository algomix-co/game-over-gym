#!/bin/bash

echo "🚀 Starting Game Over Gym server..."
echo ""
echo "Choose your server option:"
echo "1) Python 3 (recommended if you have Python installed)"
echo "2) Node.js (requires npx)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "Starting Python server on http://localhost:8000"
        echo "Press Ctrl+C to stop the server"
        python3 -m http.server 8000 || python -m http.server 8000
        ;;
    2)
        echo "Starting Node.js server on http://localhost:8000"
        echo "Press Ctrl+C to stop the server"
        npx http-server -p 8000
        ;;
    *)
        echo "Invalid choice. Please run the script again and choose 1 or 2."
        exit 1
        ;;
esac