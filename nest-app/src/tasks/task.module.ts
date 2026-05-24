import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Project } from '../projects/entities/project.entity';
import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

// 学习注释：TasksModule 管理任务功能。
// 任务会关联项目，所以这里同时注册 Task 和 Project 两个 Repository。
@Module({
  // AuthModule 提供 JwtAuthGuard；TypeOrmModule.forFeature 提供数据库 Repository。
  imports: [TypeOrmModule.forFeature([Task, Project]), AuthModule],
  controllers: [TaskController],
  providers: [TaskService],
  // SeedModule 需要复用 TaskService 创建演示任务，所以这里导出它。
  exports: [TaskService],
})
export class TasksModule {}
