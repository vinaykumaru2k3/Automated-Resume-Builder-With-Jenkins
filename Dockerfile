FROM node:18-bullseye-slim
WORKDIR /app

# In the Docker image, we ONLY want production dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN mkdir -p output

# This uses the 'generate' script from package.json
CMD ["npm", "run", "generate"]