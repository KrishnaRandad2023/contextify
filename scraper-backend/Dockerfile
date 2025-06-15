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

# Expose API port
EXPOSE 3001

# Start server
CMD ["node", "dist/server.js"]
