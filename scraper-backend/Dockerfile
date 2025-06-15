# Use official Node.js 18 image
FROM node:18

# Set working directory
WORKDIR /app

# Copy only package files to install dependencies first (cache-friendly)
COPY package*.json ./

# Install dependencies (includes TypeScript in devDependencies)
RUN npm install

# Copy remaining files
COPY . .

# Compile TypeScript (uses local tsc)
RUN npx tsc

# Expose the port used by the app
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
