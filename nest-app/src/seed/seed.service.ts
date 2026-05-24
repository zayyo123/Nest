import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { ProjectService } from '../projects/project.service';
import { TaskPriority, TaskStatus } from '../tasks/entities/task.entity';
import { TaskService } from '../tasks/task.service';

// 学习注释：SeedService 只在应用启动时被 main.ts 调用，用于保证有可登录的 demo 账号。
@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
  ) {}

  async seedIfNeeded() {
    // 先确保 demo 用户存在，再看它是否已有项目；已有项目说明不需要重复播种。
    const demoUser = await this.ensureDemoUser();
    const projects = await this.projectService.findAll(demoUser.id);

    if (projects.length > 0) {
      // 避免每次重启都创建重复的演示项目和任务。
      return;
    }

    // 复用业务 Service 创建项目和任务，这样 ownerId、默认值、关联校验逻辑保持一致。
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
    // 如果 demo 账号已经存在，直接返回，保证 seed 是幂等的。
    const existing = await this.users.findOne({ where: { email } });

    if (existing) {
      return existing;
    }

    // 密码同样只保存 bcrypt 哈希，不保存明文。
    return this.users.save(
      this.users.create({
        name: 'Demo User',
        email,
        passwordHash: await bcrypt.hash('password123', 10),
      }),
    );
  }
}
