# Docker 文件学习说明

这个目录放和容器化有关的文件。

- `backend/Dockerfile`：把 NestJS 后端打包成可以运行的 Node 容器。
- `frontend/Dockerfile`：先用 Node 构建 Vue，再用 Nginx 托管静态文件。
- `frontend/nginx.conf`：处理前端路由回退，并把 `/api` 请求代理给后端。

学习重点：Dockerfile 描述“一个服务如何构建镜像”，`docker-compose.yml` 描述“多个服务如何一起启动并互相连接”。
