# ================================
# Stage 1: Install dependencies
# ================================
FROM node:18-bullseye-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ================================
# Stage 2: Runtime + PDF generation
# ================================
FROM node:18-bullseye-slim

# Install Chromium and fonts for Puppeteer
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

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy app source
COPY . .

# One job. One purpose.
CMD ["npm", "run", "generate"]
