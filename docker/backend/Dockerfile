# 学习注释：后端镜像负责运行编译后的 NestJS 服务。
FROM node:18-alpine
WORKDIR /app
# 先安装依赖，再复制源码，能更好利用 Docker 层缓存。
COPY nest-app/package.json nest-app/package-lock.json* ./
RUN npm install --silent
COPY nest-app ./
# Nest 的 TypeScript 源码会编译到 dist 目录。
RUN npm run build
EXPOSE 3000
# 生产运行时执行编译后的 JS，而不是直接跑 TypeScript。
CMD ["node", "dist/main.js"]
