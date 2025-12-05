# Use Node.js LTS
FROM node:22-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose Vite port
EXPOSE 5173

# Start the app
CMD ["npm", "run", "dev", "--", "--host"]