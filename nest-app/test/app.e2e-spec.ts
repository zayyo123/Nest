import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

// 学习注释：每次测试注册不同邮箱，避免唯一索引冲突导致测试互相影响。
const uniqueEmail = (label: string) => {
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${safeLabel}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
};

// 学习注释：e2e 测试会启动一个接近真实的 Nest 应用，并通过 HTTP 请求验证完整链路。
describe('Project manager API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // 创建包含 AppModule 的测试应用，等于把真实模块组装起来跑。
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // 测试应用要和 main.ts 保持相同的全局前缀和校验规则，否则测试环境和真实环境不一致。
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  const register = async (label: string) => {
    // 测试里常把重复步骤封装成 helper，例如注册用户并返回 Bearer token。
    const email = uniqueEmail(label);
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: label, email, password: '123456' })
      .expect(200);

    return {
      email,
      token: res.body.accessToken as string,
      auth: `Bearer ${res.body.accessToken}`,
    };
  };

  it('rejects invalid auth payloads', async () => {
    // 验证 ValidationPipe + DTO 生效：非法邮箱、过短密码会被拒绝。
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);
  });

  it('protects project and task resources', async () => {
    // 未携带 token 访问受保护资源时，应由 JwtAuthGuard 返回 401。
    await request(app.getHttpServer()).get('/api/projects').expect(401);
    await request(app.getHttpServer()).get('/api/tasks').expect(401);
  });

  it('supports private project and task CRUD for the current user', async () => {
    // 这条测试覆盖正常用户的项目/任务创建、更新、查询流程。
    const user = await register('Owner User');

    const projectRes = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', user.auth)
      .send({
        name: 'Launch Plan',
        description: 'Private project',
        color: '#0f766e',
      })
      .expect(201);
    expect(projectRes.body.ownerId).toBeDefined();
    expect(projectRes.body.color).toBe('#0f766e');

    const taskRes = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', user.auth)
      .send({
        title: 'Write scope',
        description: 'Define MVP details',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: '2026-05-31',
        projectId: projectRes.body.id,
      })
      .expect(201);
    expect(taskRes.body.project.id).toBe(projectRes.body.id);
    expect(taskRes.body.priority).toBe('HIGH');
    expect(taskRes.body.dueDate).toBe('2026-05-31');

    await request(app.getHttpServer())
      .put(`/api/tasks/${taskRes.body.id}`)
      .set('Authorization', user.auth)
      .send({ priority: 'LOW', status: 'DONE', dueDate: null })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('DONE');
        expect(body.priority).toBe('LOW');
        expect(body.dueDate).toBeNull();
      });

    await request(app.getHttpServer())
      .get('/api/projects')
      .set('Authorization', user.auth)
      .expect(200)
      .expect(({ body }) => {
        expect(body.some((project) => project.id === projectRes.body.id)).toBe(
          true,
        );
      });
  });

  it('prevents users from reading or mutating another user workspace', async () => {
    // 这条测试验证 ownerId 隔离：用户不能读写别人的项目。
    const owner = await register('Workspace Owner');
    const outsider = await register('Workspace Outsider');

    const projectRes = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', owner.auth)
      .send({ name: 'Owner Only' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/projects/${projectRes.body.id}`)
      .set('Authorization', outsider.auth)
      .expect(404);

    await request(app.getHttpServer())
      .put(`/api/projects/${projectRes.body.id}`)
      .set('Authorization', outsider.auth)
      .send({ name: 'Hijacked' })
      .expect(404);

    await request(app.getHttpServer())
      .get('/api/projects')
      .set('Authorization', outsider.auth)
      .expect(200)
      .expect(({ body }) => {
        expect(body.some((project) => project.id === projectRes.body.id)).toBe(
          false,
        );
      });
  });

  it('prevents users from reading, mutating, or attaching tasks across workspaces', async () => {
    // 这条测试验证任务和项目关联也不能跨用户工作区。
    const owner = await register('Task Owner');
    const outsider = await register('Task Outsider');

    const projectRes = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', owner.auth)
      .send({ name: 'Owner Task Project' })
      .expect(201);

    const taskRes = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', owner.auth)
      .send({
        title: 'Private implementation task',
        projectId: projectRes.body.id,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/tasks/${taskRes.body.id}`)
      .set('Authorization', outsider.auth)
      .expect(404);

    await request(app.getHttpServer())
      .put(`/api/tasks/${taskRes.body.id}`)
      .set('Authorization', outsider.auth)
      .send({ status: 'DONE' })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/tasks/${taskRes.body.id}`)
      .set('Authorization', outsider.auth)
      .expect(404);

    await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', outsider.auth)
      .send({
        title: 'Attach to another workspace',
        projectId: projectRes.body.id,
      })
      .expect(404);

    await request(app.getHttpServer())
      .get('/api/tasks')
      .set('Authorization', outsider.auth)
      .expect(200)
      .expect(({ body }) => {
        expect(body.some((task) => task.id === taskRes.body.id)).toBe(false);
      });

    await request(app.getHttpServer())
      .get(`/api/tasks/${taskRes.body.id}`)
      .set('Authorization', owner.auth)
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('TODO');
        expect(body.project.id).toBe(projectRes.body.id);
      });
  });

  afterAll(async () => {
    // 测试结束后关闭 Nest 应用，释放数据库连接和 HTTP server。
    await app?.close();
  });
});
