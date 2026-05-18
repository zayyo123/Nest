import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Auth end-to-end (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/auth/login - should return token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@b.com', password: '123' })
      .expect(200);
    expect(res.body.accessToken).toBeDefined();
  });

  afterAll(async () => {
    await app?.close();
  });
});
