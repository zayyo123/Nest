FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/vue-app/package.json frontend/vue-app/package-lock.json* ./
RUN npm install --silent
COPY frontend/vue-app ./
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
