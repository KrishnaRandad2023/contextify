# Use a full Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install everything
COPY package*.json ./
RUN npm install

# Copy rest of your code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
