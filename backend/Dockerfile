# Dockerfile for Hospital Management System Backend
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

# Create .env file if it doesn't exist (for Railway)
RUN touch .env

# Expose port
EXPOSE 3001

# Start the backend server
CMD ["npm", "start"] 