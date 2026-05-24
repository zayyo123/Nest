# 学习注释：前端镜像使用“两阶段构建”。
# 第一阶段用 Node 安装依赖并运行 vite build，第二阶段只保留构建产物和 Nginx。
FROM node:18-alpine AS builder
WORKDIR /app
# 先复制 package 文件再 npm install，可以利用 Docker 缓存：依赖没变时不用重复安装。
COPY frontend/vue-app/package.json frontend/vue-app/package-lock.json* ./
RUN npm install --silent
COPY frontend/vue-app ./
RUN npm run build

FROM nginx:stable-alpine
# 把 Vite 输出的 dist 复制到 Nginx 默认静态目录。
COPY --from=builder /app/dist /usr/share/nginx/html
# 覆盖默认配置，加入 Vue Router 回退和 /api 代理。
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
