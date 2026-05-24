import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectService } from '../projects/project.service';
import { Task } from '../tasks/entities/task.entity';
import { TaskService } from '../tasks/task.service';
import { SeedService } from './seed.service';

// 学习注释：SeedModule 负责初始化演示数据。
// 它复用 ProjectService / TaskService，而不是绕过业务规则直接写表。
@Module({
  // 注册三个实体的 Repository：User 用于演示账号，Project/Task 用于演示业务数据。
  imports: [TypeOrmModule.forFeature([User, Project, Task])],
  providers: [SeedService, ProjectService, TaskService],
  exports: [SeedService],
})
export class SeedModule {}
