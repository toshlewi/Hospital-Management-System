FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose port
EXPOSE 3003

# Start the application
CMD serve -s build -l ${PORT:-3003}