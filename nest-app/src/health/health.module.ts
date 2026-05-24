import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

// 学习注释：HealthModule 提供健康检查接口，常用于本地调试、Docker healthcheck 或部署监控。
@Module({
  // 导入 TypeOrmModule 后，HealthController 可以注入 DataSource 测试数据库连接。
  imports: [TypeOrmModule],
  controllers: [HealthController],
})
export class HealthModule {}
