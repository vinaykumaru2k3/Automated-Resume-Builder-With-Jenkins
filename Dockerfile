FROM node:18-bullseye-slim
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --production

# Copy the rest of your code (including the new generateResume.js)
COPY . .

# Create the output directory inside the container
RUN mkdir -p output

CMD ["npm", "run", "generate"]