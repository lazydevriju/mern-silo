# Use Node.js LTS
FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Expose the API port
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]