# Nest Manager Frontend

Vue 3 frontend for Nest Manager, built with TypeScript, Vite, Vue Router,
Pinia, Element Plus, and Axios.

## 中文学习导读

这个前端项目可以按下面顺序阅读：

1. `src/main.ts`：理解 Vue 应用如何创建、注册插件、挂载到页面。
2. `src/router/index.ts`：理解前端路由和登录守卫。
3. `src/stores/auth.ts`：理解 Pinia 状态管理，以及 token 如何持久化。
4. `src/api.ts`：理解 Axios 如何统一请求地址、请求头和错误处理。
5. `src/views/*.vue`：理解具体页面如何把“模板、状态、接口请求、计算属性”组合起来。
6. `src/styles.css`：理解全局样式如何定义布局、颜色、卡片、响应式规则。

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
