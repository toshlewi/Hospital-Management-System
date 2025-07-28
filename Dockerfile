# Dockerfile for Hospital Management System Frontend
# Forces npm install instead of npm ci

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Force npm install instead of npm ci
RUN npm install --no-audit --no-fund --prefer-offline

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"] 