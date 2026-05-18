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

- API 根地址：`http://localhost:3000`
- Swagger 文档：`http://localhost:3000/docs`
- 健康检查：`http://localhost:3000/health`

## 数据库配置

后端会根据环境变量自动选择数据库：

- 配置了 `DB_HOST`：连接 MySQL。
- 没有配置 `DB_HOST`：使用本地 `sqljs` 文件 `nestlearn.db`，方便快速学习和演示。

MySQL 环境变量示例：

```bash
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nestlearn
DB_USER=root
DB_PASSWORD=root
```

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
| Auth | POST | `/auth/register` | 注册演示账号，返回模拟 token |
| Auth | POST | `/auth/login` | 登录演示账号，返回模拟 token |
| Projects | GET | `/projects` | 获取项目列表，包含关联任务 |
| Projects | POST | `/projects` | 创建项目 |
| Projects | GET | `/projects/:id` | 获取单个项目 |
| Projects | PUT | `/projects/:id` | 更新项目 |
| Projects | DELETE | `/projects/:id` | 删除项目 |
| Tasks | GET | `/tasks` | 获取任务列表，包含关联项目 |
| Tasks | POST | `/tasks` | 创建任务 |
| Tasks | GET | `/tasks/:id` | 获取单个任务 |
| Tasks | PUT | `/tasks/:id` | 更新任务 |
| Tasks | DELETE | `/tasks/:id` | 删除任务 |

## 开发提示

- `auth` 模块目前是教学用 mock 实现，后续可以替换为真实用户表、密码加密和 JWT。
- `synchronize: true` 会自动同步实体到数据库，适合开发阶段；生产环境建议使用 TypeORM migration。
- `seed` 模块会在没有项目数据时创建一个演示项目和一条演示任务。
