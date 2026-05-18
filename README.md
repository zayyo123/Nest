# Nest Learning Project

这是一个用于学习前后端分离开发的示例项目，包含 NestJS 后端、Vue 3 前端、MySQL 数据库和 Docker 编排配置。项目围绕“项目管理”和“任务管理”两个核心场景展开，适合用来练习 REST API、前端路由、状态管理、数据库实体关系和容器化部署。

## 项目结构

```text
.
├── docker/                 # 前后端 Dockerfile 与 Nginx 配置
├── docs/                   # 学习计划与每日记录
├── frontend/vue-app/       # Vue 3 + TypeScript 前端
├── nest-app/               # NestJS + TypeORM 后端
├── docker-compose.yml      # MySQL、后端、前端容器编排
└── env-setup.ps1           # Windows 环境准备脚本
```

## 技术栈

- 后端：NestJS、TypeORM、Swagger、MySQL
- 前端：Vue 3、TypeScript、Vite、Vue Router、Pinia、Element Plus、Axios
- 部署：Docker、Docker Compose、Nginx

## 核心功能

- 用户登录、注册演示接口，返回模拟 token。
- 项目 CRUD：创建、查询、更新、删除项目。
- 任务 CRUD：创建、查询、更新、删除任务，并可关联到项目。
- Swagger API 文档：后端启动后访问 `http://localhost:3000/docs`。
- 健康检查接口：`GET /health`。

## 本地开发

### 1. 启动后端

```bash
cd nest-app
npm install
npm run start:dev
```

后端默认监听 `http://localhost:3000`。

后端默认连接本机 MySQL：数据库名 `nestlearn`，用户 `root`，密码 `root`。如果数据库配置不同，可以通过 `DB_HOST`、`DB_PORT`、`DB_DATABASE`、`DB_USER`、`DB_PASSWORD` 等环境变量覆盖。

### 2. 启动前端

```bash
cd frontend/vue-app
npm install
npm run dev
```

前端默认监听 `http://localhost:5173`。开发环境中，Vite 会把 `/api` 请求代理到 `http://localhost:3000`，对应后端的全局 API 前缀。

## Docker 启动

在项目根目录执行：

```bash
docker compose up --build
```

容器启动后：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3000`
- Swagger：`http://localhost:3000/docs`
- MySQL：本机 `3306` 端口，默认数据库 `nestlearn`

## 常用命令

后端：

```bash
cd nest-app
npm run start:dev
npm run build
npm run test
```

前端：

```bash
cd frontend/vue-app
npm run dev
npm run build
npm run preview
```

## 接口速览

| 模块 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| Auth | POST | `/api/auth/register` | 注册演示账号，返回模拟 token |
| Auth | POST | `/api/auth/login` | 登录演示账号，返回模拟 token |
| Projects | GET | `/api/projects` | 获取项目列表 |
| Projects | POST | `/api/projects` | 创建项目 |
| Projects | GET | `/api/projects/:id` | 获取项目详情 |
| Projects | PUT | `/api/projects/:id` | 更新项目 |
| Projects | DELETE | `/api/projects/:id` | 删除项目 |
| Tasks | GET | `/api/tasks` | 获取任务列表 |
| Tasks | POST | `/api/tasks` | 创建任务 |
| Tasks | GET | `/api/tasks/:id` | 获取任务详情 |
| Tasks | PUT | `/api/tasks/:id` | 更新任务 |
| Tasks | DELETE | `/api/tasks/:id` | 删除任务 |

## 学习建议

建议按这个顺序阅读源码：

1. `nest-app/src/app.module.ts`：理解模块注册、数据库连接和实体扫描。
2. `nest-app/src/projects` 与 `nest-app/src/tasks`：理解 Controller、Service、Entity、DTO 的分层。
3. `frontend/vue-app/src/api.ts`：理解前端如何统一请求后端。
4. `frontend/vue-app/src/router/index.ts` 与 `src/stores/auth.ts`：理解路由守卫和登录状态。
5. `frontend/vue-app/src/views`：理解页面如何调用 API 并渲染数据。

## 注意事项

- 当前登录注册是教学用 mock 实现，不会校验账号密码，也不会签发真实 JWT。
- `synchronize: true` 适合开发和学习，生产环境应改为迁移脚本管理数据库结构。
- Docker 前端通过 Nginx 代理 `/api/` 到后端容器；本地开发前端通过 Vite 代理 `/api` 到 `localhost:3000`。
