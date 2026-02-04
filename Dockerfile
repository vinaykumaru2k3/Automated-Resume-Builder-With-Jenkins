# Multi-stage build: dependencies and runtime
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production and development dependencies
RUN npm ci

# Copy application code
COPY . .

# Run tests and validation
RUN npm run test

# Expose no ports (this is a batch processing application)
# Container runs validation and generation as needed

# Default command: validate and generate
CMD ["npm", "run", "dev"]
