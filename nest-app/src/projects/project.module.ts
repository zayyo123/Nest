import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Project } from './entities/project.entity';
import { ProjectsController } from './project.controller';
import { ProjectService } from './project.service';

// 学习注释：ProjectsModule 是项目功能的边界。
// Controller 负责 HTTP，Service 负责业务，Project Entity 负责数据库表映射。
@Module({
  // 导入 AuthModule 是因为 ProjectsController 使用了 JwtAuthGuard。
  // forFeature([Project]) 让 ProjectService 可以注入 Project Repository。
  imports: [TypeOrmModule.forFeature([Project]), AuthModule],
  controllers: [ProjectsController],
  providers: [ProjectService],
  // 导出 ProjectService 后，SeedModule 可以复用它创建演示项目。
  exports: [ProjectService],
})
export class ProjectsModule {}
