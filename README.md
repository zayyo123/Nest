# Nest Manager

[![CI](https://github.com/zayyo123/Nest/actions/workflows/ci.yml/badge.svg)](https://github.com/zayyo123/Nest/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Nest Manager is a full-stack project and task management application built with
NestJS, Vue 3, TypeScript, TypeORM, JWT authentication, Swagger, and Docker.

It is designed as a clean learning-friendly codebase: small enough to understand
quickly, but structured like a real application with separated backend,
frontend, API documentation, authentication guards, tests, and deployment files.

## 中文学习导读

这份项目已经在主要源码、配置、Docker、CI 和测试文件里加入了中文学习注释。建议按这条路线阅读：

1. 先看 `frontend/vue-app/src/main.ts`、`App.vue`、`router/index.ts`，理解 Vue 应用如何启动和切页面。
2. 再看 `frontend/vue-app/src/api.ts`、`stores/auth.ts`，理解登录 token 如何保存、如何自动带到请求头。
3. 接着读 `frontend/vue-app/src/views/*.vue` 和 `styles.css`，学习页面状态、筛选、分页、弹窗和响应式布局。
4. 后端从 `nest-app/src/main.ts`、`app.module.ts` 开始，再读 `auth`、`projects`、`tasks` 三个业务目录。
5. 最后读 `docker-compose.yml`、`.github/workflows/ci.yml` 和 `nest-app/test/app.e2e-spec.ts`，理解部署和自动化检查。

注意：`package.json`、`package-lock.json`、`tsconfig.json`、`.prettierrc`、`nest-cli.json` 这类 JSON 文件不支持标准注释，强行加 `//` 会导致工具解析失败。因此这些文件保持合法 JSON，相关学习说明放在 README 和相邻源码注释中。

## Features

- User registration and login with hashed passwords and JWT tokens
- Protected project and task CRUD APIs
- Private workspaces: every project and task belongs to the authenticated user
- Dashboard metrics for projects, tasks, completion rate, and recent work
- Vue 3 frontend with Pinia, Vue Router, Element Plus, and Axios
- Swagger API docs at `http://localhost:3000/docs`
- Docker Compose setup for MySQL, backend, and frontend
- sql.js fallback for quick local development without MySQL

## Tech Stack

| Area | Tools |
| --- | --- |
| Backend | NestJS, TypeORM, JWT, Swagger, MySQL, sql.js |
| Frontend | Vue 3, TypeScript, Vite, Pinia, Vue Router, Element Plus |
| Tooling | Docker, Docker Compose, Jest, GitHub Actions |

## Repository Layout

```text
.
|-- docker/                 # Dockerfiles and Nginx config
|-- docs/                   # Learning notes and project docs
|-- frontend/vue-app/       # Vue frontend
|-- nest-app/               # NestJS backend
|-- docker-compose.yml      # MySQL + backend + frontend orchestration
`-- env-setup.ps1           # Windows development helper
```

## Quick Start

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Docker Desktop, optional for the Compose setup

### Backend

```bash
cd nest-app
npm install
npm run start:dev
```

The backend runs at `http://localhost:3000` and exposes APIs under `/api`.

Without `DB_HOST`, the backend uses sql.js for a quick local database. To use
MySQL, copy the example environment file and update the values:

```bash
cd nest-app
cp .env.example .env
```

On first startup the backend seeds a demo account:

```text
Email: demo@example.com
Password: password123
```

### Frontend

```bash
cd frontend/vue-app
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the
backend.

## Docker

From the repository root:

```bash
docker compose up --build
```

Available services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- Health check: `http://localhost:3000/api/health`

## Useful Commands

Backend:

```bash
cd nest-app
npm run build
npm run test
npm run test:e2e
```

Frontend:

```bash
cd frontend/vue-app
npm run typecheck
npm run build
npm run preview
```

## API Overview

| Module | Method | Path | Description |
| --- | --- | --- | --- |
| Auth | POST | `/api/auth/register` | Register and receive a JWT |
| Auth | POST | `/api/auth/login` | Login and receive a JWT |
| Projects | GET | `/api/projects` | List projects |
| Projects | POST | `/api/projects` | Create a project |
| Projects | GET | `/api/projects/:id` | Get project details |
| Projects | PUT | `/api/projects/:id` | Update a project |
| Projects | DELETE | `/api/projects/:id` | Delete a project |
| Tasks | GET | `/api/tasks` | List tasks |
| Tasks | POST | `/api/tasks` | Create a task |
| Tasks | GET | `/api/tasks/:id` | Get task details |
| Tasks | PUT | `/api/tasks/:id` | Update a task |
| Tasks | DELETE | `/api/tasks/:id` | Delete a task |

Project and task routes require a bearer token. Results are scoped to the
current authenticated user, so users cannot read or mutate one another's
projects or tasks.

```text
Authorization: Bearer <token>
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before
opening a pull request.

## Security

Please do not open public issues for security vulnerabilities. Follow the
instructions in [SECURITY.md](SECURITY.md).

## License

Released under the [MIT License](LICENSE).
