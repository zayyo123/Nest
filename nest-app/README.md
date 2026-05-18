# Nest Manager Backend

NestJS API for authentication, projects, tasks, health checks, and Swagger docs.

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
