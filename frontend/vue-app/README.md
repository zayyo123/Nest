# Nest Manager Frontend

Vue 3 frontend for Nest Manager, built with TypeScript, Vite, Vue Router,
Pinia, Element Plus, and Axios.

The development server proxies `/api` requests to the NestJS backend so
components can use relative API paths such as `api.get('/projects')`.

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Project and task metrics
- `/projects` - Project list, search, create, edit, and delete
- `/tasks` - Task list, filters, create, edit, and delete

## Development

Start the backend at `http://localhost:3000`, then run:

```bash
npm run dev
```

The frontend is available at `http://localhost:5173`.

The backend seed creates a demo login:

```text
Email: demo@example.com
Password: password123
```
