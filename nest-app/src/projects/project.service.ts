import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(Project) private repo: Repository<Project>) {}

  findAll(): Promise<Project[]> {
    return this.repo.find({
      relations: ['tasks'],
      order: { id: 'DESC' },
    });
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.repo.create(dto);
    return this.repo.save(project) as unknown as Promise<Project>;
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.repo.findOne({ where: { id }, relations: ['tasks'] });
    if (!project) {
      throw new NotFoundException(`Project ${id} was not found`);
    }
    return project;
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Project ${id} was not found`);
    }
  }
}
