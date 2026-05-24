import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

// 学习注释：GET /api/health 用于检查后端和数据库是否正常。
@Controller('health')
export class HealthController {
  // DataSource 是 TypeORM 的数据库连接对象。
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    let database = 'disconnected';

    try {
      // SELECT 1 是最轻量的数据库连通性测试之一。
      await this.dataSource.query('SELECT 1');
      database = 'connected';
    } catch {
      database = 'error';
    }

    return {
      // OK 表示数据库可用；DEGRADED 表示应用还活着，但依赖的数据库异常。
      status: database === 'connected' ? 'OK' : 'DEGRADED',
      database,
      ts: new Date().toISOString(),
    };
  }
}
