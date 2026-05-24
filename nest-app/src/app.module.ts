import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { databaseOptions } from './database/data-source.options';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/project.module';
import { SeedModule } from './seed/seed.module';
import { TasksModule } from './tasks/task.module';

// 学习注释：@Module 是 NestJS 的核心组织方式。
// 一个模块通常包含 imports（依赖模块）、controllers（HTTP 入口）、providers（业务服务）。
@Module({
  imports: [
    // TypeOrmModule.forRoot 建立数据库连接，后续各功能模块才能注入 Repository。
    TypeOrmModule.forRoot(databaseOptions),
    // AuthModule 负责登录注册、JWT、鉴权守卫。
    AuthModule,
    // ProjectsModule 和 TasksModule 是主要业务模块。
    ProjectsModule,
    TasksModule,
    // HealthModule 提供健康检查接口，SeedModule 提供演示数据初始化。
    HealthModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
