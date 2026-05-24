# Nest Manager Backend

NestJS API for authentication, projects, tasks, health checks, and Swagger docs.

## 中文学习导读

建议按这个顺序阅读后端代码：

1. `src/main.ts`：应用启动入口，理解全局前缀、校验管道、CORS、Swagger。
2. `src/app.module.ts`：根模块，理解 Nest 如何把各功能模块组装起来。
3. `src/auth/*`：登录注册、JWT 签发、Guard 鉴权、当前用户装饰器。
4. `src/projects/*`：项目 CRUD 的 Controller、Service、Entity、DTO。
5. `src/tasks/*`：任务 CRUD，以及任务和项目的多对一关系。
6. `src/database/data-source.options.ts`：数据库连接配置和环境变量读取。
7. `test/app.e2e-spec.ts`：端到端测试，学习如何从 HTTP 层验证完整业务流程。

## Setup

```bash
npm install
copy .env.example .env
npm run start:dev
```

If `DB_HOST` is not set, the app uses the sql.js fallback database for quick local demos. Set the MySQL variables in `.env` to use MySQL.

The seed step creates a demo account when needed:

```text
Email: demo@example.com
Password: password123
```

## Scripts

```bash
npm run build
npm run test
npm run test:e2e
npm run start:prod
```

## Endpoints

- Swagger: `http://localhost:3000/docs`
- Health: `GET /api/health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Projects: `/api/projects`
- Tasks: `/api/tasks`

Project and task endpoints require a bearer token returned by login or register.
Those resources are scoped to the authenticated user.
