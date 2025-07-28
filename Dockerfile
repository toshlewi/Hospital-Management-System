# Dockerfile for Hospital Management System Frontend
# Forces npm install instead of npm ci - Railway Deployment

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Force npm install instead of npm ci with explicit flags
RUN npm install --no-audit --no-fund --prefer-offline --production=false

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the app
CMD ["serve", "-s", "build", "-l", "$PORT"] 