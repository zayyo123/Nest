import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskPriority, TaskStatus } from './entities/task.entity';

// 学习注释：TaskService 负责任务的业务规则。
// 这里最重要的规则是：任务和项目都必须属于当前登录用户。
@Injectable()
export class TaskService {
  constructor(
    // 注入 Task Repository，用来操作任务表。
    @InjectRepository(Task) private repo: Repository<Task>,
    // 注入 Project Repository，用来校验任务关联的项目是否存在且属于当前用户。
    @InjectRepository(Project) private projectRepo: Repository<Project>,
  ) {}

  findAll(ownerId: number): Promise<Task[]> {
    return this.repo.find({
      // 所有任务查询都按 ownerId 过滤，防止用户看到别人的任务。
      where: { ownerId },
      // 加载 project 关系，前端任务卡片可直接显示项目名称和颜色。
      relations: ['project'],
      order: { id: 'DESC' },
    });
  }

  async create(ownerId: number, dto: CreateTaskDto): Promise<Task> {
    // 没传状态/优先级时，使用待办和中优先级作为默认值。
    const task = this.repo.create({
      ownerId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      status: dto.status || TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate || null,
    });

    if (dto.projectId) {
      // 关联项目之前先查项目是否属于当前用户，避免跨用户挂载任务。
      task.project = await this.findProject(ownerId, dto.projectId);
      task.projectId = dto.projectId;
    }

    // save 后再 findOne，是为了返回带 project 关系的完整任务对象。
    await this.repo.save(task);
    return this.findOne(ownerId, task.id);
  }

  async findOne(ownerId: number, id: number): Promise<Task> {
    const task = await this.repo.findOne({
      // 同时匹配 id 和 ownerId，是所有私有资源接口的核心保护方式。
      where: { id, ownerId },
      relations: ['project'],
    });

    if (!task) {
      throw new NotFoundException(`任务 ${id} 不存在`);
    }

    return task;
  }

  async update(ownerId: number, id: number, dto: UpdateTaskDto): Promise<Task> {
    // 先查出任务，顺便确认它属于当前用户。
    const task = await this.findOne(ownerId, id);

    // 只有 dto 中明确传来的字段才更新，没传的字段保持原值。
    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.description !== undefined) {
      task.description = dto.description?.trim() || null;
    }
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueDate !== undefined) task.dueDate = dto.dueDate || null;
    if (dto.projectId !== undefined) {
      // projectId 为 null/空时表示取消关联；有值时必须校验项目归属。
      task.project = dto.projectId
        ? await this.findProject(ownerId, dto.projectId)
        : null;
      task.projectId = dto.projectId || null;
    }

    await this.repo.save(task);
    return this.findOne(ownerId, id);
  }

  async remove(ownerId: number, id: number): Promise<void> {
    // delete 条件里带 ownerId，防止删除别人的任务。
    const result = await this.repo.delete({ id, ownerId });
    if (!result.affected) {
      throw new NotFoundException(`任务 ${id} 不存在`);
    }
  }

  private async findProject(
    ownerId: number,
    projectId: number,
  ): Promise<Project> {
    // 这个私有方法封装“项目必须存在且属于当前用户”的重复规则。
    const project = await this.projectRepo.findOne({
      where: { id: Number(projectId), ownerId },
    });

    if (!project) {
      throw new NotFoundException(`项目 ${projectId} 不存在`);
    }

    return project;
  }
}
