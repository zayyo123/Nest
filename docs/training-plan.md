# Nest 学习型教学项目 - 第一轮计划（Vue + Nest + MySQL）

目标：通过一体化的前后端学习，掌握 NestJS、Vue 3 + TypeScript、MySQL 的基础与协作能力。

总览：为期8周，分为前端（Vue）与后端（Nest）并行推进，包含容器化和基础测试。每周给出明确任务与验收标准。

第1周：环境搭建与基础接口
- 完成后端：Auth 路由（/register、/login）、Swagger 文档入口
- 完成前端：登录注册表单，接入后端 API，路由搭建
- 验收：能够完成登录并跳转到仪表盘

第2周：数据模型设计与初步 CRUD（Projects）
- 后端：Projects 实体、CRUD 接口实现、数据持久化（MySQL）
- 前端：Projects 列表、创建表单UI
- 验收：创建和读取项目数据

第3周：数据模型扩展与 CRUD（Tasks）
- 后端：Task 实体、CRUD、项目关联
- 前端：Tasks 列表/创建/编辑，和 Projects 关联演示
- 验收：任务的创建、查询、更新、删除，以及所属项目联动

第4周：鉴权强化与 API 文档
- 后端：JWT 验证演示（基础），更新 Swagger 文档
- 前端：在页面上演示需要鉴权的端点调用
- 验收：/docs 页面可浏览，端点访问需要鉴权的演示

第5周：前端美化与 UI 框架集成
- 引入 Element Plus，提升 UI 体验
- 完成登录、注册、仪表盘、项目/任务的美观界面
- 验收：UI 漂亮且响应式良好

第6周：本地部署与容器化基础
- 编写 Dockerfile、docker-compose.yml，整合 MySQL、Nest 后端、Vue 前端
- 验收：使用 docker-compose up -d 启动一套本地环境

第7周：测试与简单 CI/CD 思路
- 后端：单元/集成测试示例（Jest）
- 前端：组件测试/简单端到端测试思路
- CI/CD：GitHub Actions 的基本模板（测试+构建）

第8周：总结与扩展路线
- 探索 GraphQL、微服务、性能优化等方向
- 提交一版最终教学总结文档
