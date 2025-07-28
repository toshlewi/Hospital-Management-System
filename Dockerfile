FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline --production=false
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003 || exit 1
CMD serve -s build -l ${PORT:-3003}