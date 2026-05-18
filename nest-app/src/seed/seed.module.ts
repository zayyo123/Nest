import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { SeedService } from './seed.service';
import { ProjectService } from '../projects/project.service';
import { TaskService } from '../tasks/task.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Task])],
  providers: [SeedService, ProjectService, TaskService],
  exports: [SeedService],
})
export class SeedModule {}
