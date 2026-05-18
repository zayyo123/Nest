import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

const uniqueEmail = (label: string) => {
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${safeLabel}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
};

describe('Project manager API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
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
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);
  });

  it('protects project and task resources', async () => {
    await request(app.getHttpServer()).get('/api/projects').expect(401);
    await request(app.getHttpServer()).get('/api/tasks').expect(401);
  });

  it('supports private project and task CRUD for the current user', async () => {
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
    await app?.close();
  });
});
