FROM node:18-bullseye-slim

# 1. Set environment variables
ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 2. Install Chromium and fonts
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-dejavu \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 3. Copy the already-installed node_modules first (for speed/caching)
COPY node_modules ./node_modules
# 4. Copy the rest of the application
COPY . .

# 5. Run the generation script
CMD ["npm", "run", "generate"]