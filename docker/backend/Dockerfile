FROM node:18-alpine
WORKDIR /app
COPY nest-app/package.json nest-app/package-lock.json* ./
RUN npm install --silent
COPY nest-app ./
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
