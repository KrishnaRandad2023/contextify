# Use Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build TypeScript
RUN npx tsc

# Expose port
EXPOSE 3001

# Run server
CMD ["node", "dist/server.js"]
