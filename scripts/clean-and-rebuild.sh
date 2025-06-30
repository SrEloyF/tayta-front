#!/bin/bash

# Stop and remove any existing containers
docker-compose down --remove-orphans

# Remove node_modules and package-lock.json
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

# Install dependencies
npm install

# Rebuild the Docker image
docker-compose build --no-cache

echo "Clean and rebuild complete. You can now start the application with:"
echo "docker-compose up"
