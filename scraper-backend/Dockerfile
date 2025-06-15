# ✅ Use official Playwright image with Chrome, Firefox, WebKit + Node preinstalled
FROM mcr.microsoft.com/playwright:v1.39.0-jammy

# Set working directory
WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Build TypeScript files
RUN npm run build

# Tell Render which port to expose
EXPOSE 3001

# Run the app
CMD ["node", "dist/server.js"]
