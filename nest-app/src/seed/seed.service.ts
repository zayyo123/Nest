import { Injectable } from '@nestjs/common';
import { ProjectService } from '../projects/project.service';
import { TaskService } from '../tasks/task.service';
import { CreateProjectDto } from '../projects/dto/create-project.dto';

@Injectable()
export class SeedService {
  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
  ) {}

  async seedIfNeeded() {
    // Only seed an empty database so manually created learning data is never overwritten.
    const all = await this.projectService.findAll();
    if (!all || all.length === 0) {
      const p = await this.projectService.create({
        name: 'Demo Project',
        description: 'Seed data project',
      } as CreateProjectDto);
      // Give the UI one related task immediately after the first startup.
      await this.taskService.create({
        title: 'Initial Task',
        description: 'Seed task',
        status: 'TODO',
        projectId: p.id,
      } as any);
    }
  }
}
