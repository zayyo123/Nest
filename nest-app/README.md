# NestJS 后端说明

本目录是项目的后端服务，负责提供登录注册演示接口、项目管理接口、任务管理接口、健康检查接口和 Swagger 文档。

## 目录结构

```text
src/
├── app.module.ts           # 应用根模块，注册数据库和业务模块
├── main.ts                 # 应用启动入口，配置 Swagger 和种子数据
├── auth/                   # 登录/注册演示接口
├── health/                 # 健康检查接口
├── projects/               # 项目 CRUD 模块
├── tasks/                  # 任务 CRUD 模块
└── seed/                   # 首次启动时写入演示数据
```

## 启动方式

```bash
npm install
npm run start:dev
```

默认端口是 `3000`。启动后可以访问：

- API 根地址：`http://localhost:3000/api`
- Swagger 文档：`http://localhost:3000/docs`
- 健康检查：`http://localhost:3000/api/health`

也可以在仓库根目录通过 Docker 一次启动 MySQL、后端和前端：

```bash
docker compose up --build
```

## 数据库配置

后端默认连接 MySQL。数据库连接配置集中在 `src/database/data-source.options.ts`，默认值适合本机或 Docker 教学环境：

MySQL 环境变量示例：

```bash
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nestlearn
DB_USER=root
DB_PASSWORD=root
DB_SYNCHRONIZE=true
```

本地开发可以复制 `.env.example` 为 `.env` 后再启动。`DB_SYNCHRONIZE=true` 会根据实体自动建表，适合开发阶段；生产环境建议关闭并改用 migration。

## 常用命令

```bash
npm run start:dev   # 开发模式，监听文件变化
npm run build       # 编译到 dist/
npm run start:prod  # 运行编译后的产物
npm run test        # 单元测试
npm run test:e2e    # 端到端测试
```

## 接口说明

| 模块 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| Auth | POST | `/api/auth/register` | 注册演示账号，返回模拟 token |
| Auth | POST | `/api/auth/login` | 登录演示账号，返回模拟 token |
| Projects | GET | `/api/projects` | 获取项目列表，包含关联任务 |
| Projects | POST | `/api/projects` | 创建项目 |
| Projects | GET | `/api/projects/:id` | 获取单个项目 |
| Projects | PUT | `/api/projects/:id` | 更新项目 |
| Projects | DELETE | `/api/projects/:id` | 删除项目 |
| Tasks | GET | `/api/tasks` | 获取任务列表，包含关联项目 |
| Tasks | POST | `/api/tasks` | 创建任务 |
| Tasks | GET | `/api/tasks/:id` | 获取单个任务 |
| Tasks | PUT | `/api/tasks/:id` | 更新任务 |
| Tasks | DELETE | `/api/tasks/:id` | 删除任务 |

创建任务时可以通过 `projectId` 关联项目：

```json
{
  "title": "Initial Task",
  "description": "Seed task",
  "status": "TODO",
  "projectId": 1
}
```

## 开发提示

- `auth` 模块目前是教学用 mock 实现，后续可以替换为真实用户表、密码加密和 JWT。
- `src/database/data-source.options.ts` 负责读取数据库环境变量并配置 TypeORM。
- `synchronize: true` 会自动同步实体到数据库，适合开发阶段；生产环境建议使用 TypeORM migration。
- `seed` 模块会在没有项目数据时创建一个演示项目和一条演示任务。
