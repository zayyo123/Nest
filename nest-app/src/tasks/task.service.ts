import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskPriority, TaskStatus } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private repo: Repository<Task>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
  ) {}

  findAll(ownerId: number): Promise<Task[]> {
    return this.repo.find({
      where: { ownerId },
      relations: ['project'],
      order: { id: 'DESC' },
    });
  }

  async create(ownerId: number, dto: CreateTaskDto): Promise<Task> {
    const task = this.repo.create({
      ownerId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      status: dto.status || TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate || null,
    });

    if (dto.projectId) {
      task.project = await this.findProject(ownerId, dto.projectId);
      task.projectId = dto.projectId;
    }

    await this.repo.save(task);
    return this.findOne(ownerId, task.id);
  }

  async findOne(ownerId: number, id: number): Promise<Task> {
    const task = await this.repo.findOne({
      where: { id, ownerId },
      relations: ['project'],
    });

    if (!task) {
      throw new NotFoundException(`任务 ${id} 不存在`);
    }

    return task;
  }

  async update(ownerId: number, id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(ownerId, id);

    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.description !== undefined) {
      task.description = dto.description?.trim() || null;
    }
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueDate !== undefined) task.dueDate = dto.dueDate || null;
    if (dto.projectId !== undefined) {
      task.project = dto.projectId
        ? await this.findProject(ownerId, dto.projectId)
        : null;
      task.projectId = dto.projectId || null;
    }

    await this.repo.save(task);
    return this.findOne(ownerId, id);
  }

  async remove(ownerId: number, id: number): Promise<void> {
    const result = await this.repo.delete({ id, ownerId });
    if (!result.affected) {
      throw new NotFoundException(`任务 ${id} 不存在`);
    }
  }

  private async findProject(
    ownerId: number,
    projectId: number,
  ): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: Number(projectId), ownerId },
    });

    if (!project) {
      throw new NotFoundException(`项目 ${projectId} 不存在`);
    }

    return project;
  }
}
