import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

const DEFAULT_PROJECT_COLOR = '#2563eb';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(Project) private repo: Repository<Project>) {}

  findAll(ownerId: number): Promise<Project[]> {
    return this.repo.find({
      where: { ownerId },
      relations: ['tasks'],
      order: { id: 'DESC' },
    });
  }

  async create(ownerId: number, dto: CreateProjectDto): Promise<Project> {
    const project = this.repo.create({
      ownerId,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      color: dto.color || DEFAULT_PROJECT_COLOR,
    });

    return this.repo.save(project) as unknown as Promise<Project>;
  }

  async findOne(ownerId: number, id: number): Promise<Project> {
    const project = await this.repo.findOne({
      where: { id, ownerId },
      relations: ['tasks'],
    });

    if (!project) {
      throw new NotFoundException(`项目 ${id} 不存在`);
    }

    return project;
  }

  async update(
    ownerId: number,
    id: number,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(ownerId, id);

    if (dto.name !== undefined) project.name = dto.name.trim();
    if (dto.description !== undefined) {
      project.description = dto.description?.trim() || null;
    }
    if (dto.color !== undefined) project.color = dto.color;

    await this.repo.save(project);
    return this.findOne(ownerId, id);
  }

  async remove(ownerId: number, id: number): Promise<void> {
    const result = await this.repo.delete({ id, ownerId });
    if (!result.affected) {
      throw new NotFoundException(`项目 ${id} 不存在`);
    }
  }
}
