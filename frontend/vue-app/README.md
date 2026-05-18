# Vue 3 前端说明

本目录是项目的前端应用，使用 Vue 3、TypeScript、Vite、Vue Router、Pinia、Element Plus 和 Axios 构建。前端通过 `/api` 统一访问 NestJS 后端。

## 目录结构

```text
src/
├── api.ts                  # Axios 实例和请求拦截器
├── main.ts                 # 前端应用入口
├── router/index.ts         # 路由配置和登录守卫
├── stores/auth.ts          # 登录状态和 token 存储
├── components/NavBar.vue   # 顶部导航栏
└── views/                  # 页面组件
```

## 启动方式

启动前请先确保后端服务运行在 `http://localhost:3000`。

```bash
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

## 请求代理

开发环境下，`vite.config.ts` 会把所有 `/api` 请求代理到：

```text
http://localhost:3000
```

因此页面中只需要调用类似 `api.get('/projects')` 的相对路径，不需要在组件里硬编码后端地址。

## 页面说明

- `/login`：登录页面，调用 `/auth/login`。
- `/register`：注册页面，调用 `/auth/register`。
- `/dashboard`：仪表盘页面。
- `/projects`：项目列表、搜索、新建、编辑、删除和详情查看。
- `/tasks`：任务列表、状态筛选、项目筛选、新建、编辑和删除。

## 常用命令

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 开发提示

- 登录 token 存在 `localStorage` 中，并由 `src/api.ts` 自动加到请求头。
- 需要登录的页面在 `src/router/index.ts` 中通过 `meta.requiresAuth` 标记。
- UI 组件来自 Element Plus，页面逻辑主要在 `src/views` 中。
