FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline
COPY . .
RUN touch .env
EXPOSE 3001
CMD ["npm", "start"]