FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline --production=false
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3003
CMD serve -s build -l ${PORT:-3003}