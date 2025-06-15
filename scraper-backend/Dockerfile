# Use a full Node base image
FROM node:18

# Set working folder in container
WORKDIR /app

# Copy only package files first (faster install if no change)
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy remaining source files
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Let container know it will use port 3001
EXPOSE 3001

# Start the server using compiled JS
CMD ["node", "dist/server.js"]
