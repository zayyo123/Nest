import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private repo: Repository<Task>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
  ) {}

  findAll(): Promise<Task[]> {
    return this.repo.find({
      relations: ['project'],
      order: { id: 'DESC' },
    });
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.repo.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
    });

    if (dto.projectId) {
      task.project = await this.findProject(dto.projectId);
    }

    return this.repo.save(task) as unknown as Promise<Task>;
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.repo.findOne({ where: { id }, relations: ['project'] });
    if (!task) {
      throw new NotFoundException(`Task ${id} was not found`);
    }
    return task;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.projectId !== undefined) {
      task.project = dto.projectId ? await this.findProject(dto.projectId) : null;
      task.projectId = dto.projectId || null;
    }

    await this.repo.save(task);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Task ${id} was not found`);
    }
  }

  private async findProject(projectId: number): Promise<Project> {
    const project = await this.projectRepo.findOne({ where: { id: Number(projectId) } });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} was not found`);
    }
    return project;
  }
}
