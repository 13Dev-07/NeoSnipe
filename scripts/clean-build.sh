#!/bin/bash

# Exit on error
set -e

echo "Starting clean build process..."

# Remove dependency lock files
rm -f package-lock.json
rm -f yarn.lock

# Clear node_modules
rm -rf node_modules

# Clean Next.js cache
rm -rf .next

# Clean Jest cache
jest --clearCache

# Reinstall dependencies
npm install

echo "Clean build complete. Starting development server..."
npm run dev