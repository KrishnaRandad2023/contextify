# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy only backend package files first
COPY package.json package-lock.json ./

# Install dependencies for scraper-backend
RUN npm install

# Copy rest of backend code
COPY . .

# Compile TypeScript
RUN npm run build
# Use full Node.js image with Debian for Playwright compatibility
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the source
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 3001

# Start the compiled server
CMD ["node", "dist/server.js"]

# Expose API port
EXPOSE 3001

# Start server
CMD ["node", "dist/server.js"]
