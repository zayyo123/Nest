import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectService } from '../projects/project.service';
import { Task } from '../tasks/entities/task.entity';
import { TaskService } from '../tasks/task.service';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Task])],
  providers: [SeedService, ProjectService, TaskService],
  exports: [SeedService],
})
export class SeedModule {}
