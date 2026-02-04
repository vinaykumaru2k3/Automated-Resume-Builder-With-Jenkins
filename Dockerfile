# Use the same base image
FROM node:18-bullseye-slim

# 1. Set environment variables early
# These tell Puppeteer to use the system-installed Chromium instead of downloading its own
ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 2. Install Chromium and essential fonts
# We combine update, install, and cleanup into one layer to keep the image slim
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-dejavu \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 3. Copy everything from the Jenkins workspace
# This includes the 'node_modules' folder already created by the previous Jenkins stage
COPY . .

# 4. Run the generation script
CMD ["npm", "run", "generate"]