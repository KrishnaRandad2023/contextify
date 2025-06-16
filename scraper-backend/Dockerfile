# ✅ Use Playwright's official image with Chromium, Firefox, WebKit & Node.js pre-installed
FROM mcr.microsoft.com/playwright:v1.39.0-jammy

# Set working directory
WORKDIR /app

# Copy only package files first (improves Docker cache)
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of the app code
COPY . .

# Build TypeScript (outputs to dist/)
RUN npm run build

# Expose port for Render
EXPOSE 3001

# Start the compiled server (Express backend)
CMD ["node", "dist/server.js"]
