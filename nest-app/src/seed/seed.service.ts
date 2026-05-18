import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { ProjectService } from '../projects/project.service';
import { TaskPriority, TaskStatus } from '../tasks/entities/task.entity';
import { TaskService } from '../tasks/task.service';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
  ) {}

  async seedIfNeeded() {
    const demoUser = await this.ensureDemoUser();
    const projects = await this.projectService.findAll(demoUser.id);

    if (projects.length > 0) {
      return;
    }

    const project = await this.projectService.create(demoUser.id, {
      name: '演示项目',
      description: '首次启动自动创建的演示项目',
      color: '#2563eb',
    });

    await this.taskService.create(demoUser.id, {
      title: '初始任务',
      description: '首次启动自动创建的演示任务',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: new Date().toISOString().slice(0, 10),
      projectId: project.id,
    });
  }

  private async ensureDemoUser(): Promise<User> {
    const email = 'demo@example.com';
    const existing = await this.users.findOne({ where: { email } });

    if (existing) {
      return existing;
    }

    return this.users.save(
      this.users.create({
        name: 'Demo User',
        email,
        passwordHash: await bcrypt.hash('password123', 10),
      }),
    );
  }
}
