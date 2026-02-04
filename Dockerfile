# ================================
# Stage 1: Install dependencies
# ================================
FROM node:18-bullseye-slim AS deps

WORKDIR /app

COPY package*.json ./

# Added flags to prevent hangs and reduce memory usage:
# --no-audit: Skip security checks during install
# --prefer-offline: Use local cache if possible
# --maxsockets 1: Reduce concurrent network requests (good for restricted CI environments)
RUN npm ci --no-audit --prefer-offline --maxsockets 3

# ================================
# Stage 2: Runtime + PDF generation
# ================================
FROM node:18-bullseye-slim

# Set environment variables early
ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install Chromium and fonts (Keep this as one layer to save space)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-dejavu \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only what is strictly necessary from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure the app handles paths correctly in the container
CMD ["npm", "run", "generate"]