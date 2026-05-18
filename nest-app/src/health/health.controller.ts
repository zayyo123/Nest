import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    let database = 'disconnected';

    try {
      await this.dataSource.query('SELECT 1');
      database = 'connected';
    } catch {
      database = 'error';
    }

    return {
      status: database === 'connected' ? 'OK' : 'DEGRADED',
      database,
      ts: new Date().toISOString(),
    };
  }
}
