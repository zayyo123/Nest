import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

const DEFAULT_PROJECT_COLOR = '#2563eb';

// 学习注释：Service 是业务逻辑层。
// Controller 不直接操作数据库，而是把 ownerId 和 DTO 交给这里处理。
@Injectable()
export class ProjectService {
  // Repository 是 TypeORM 提供的数据访问对象，负责查询、保存、删除 Project 表数据。
  constructor(@InjectRepository(Project) private repo: Repository<Project>) {}

  findAll(ownerId: number): Promise<Project[]> {
    return this.repo.find({
      // 所有查询都带 ownerId，保证用户只能看到自己的项目。
      where: { ownerId },
      // relations: ['tasks'] 会同时加载项目关联的任务，前端可直接计算完成率。
      relations: ['tasks'],
      order: { id: 'DESC' },
    });
  }

  async create(ownerId: number, dto: CreateProjectDto): Promise<Project> {
    // repo.create 只创建实体实例，还没有写入数据库；repo.save 才真正保存。
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
      // 同时匹配 id 和 ownerId，避免用户通过猜 id 访问别人的项目。
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
    // 先通过 findOne 校验项目存在且属于当前用户，再修改字段。
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
    // delete 同样带 ownerId，防止删除别人的项目。
    const result = await this.repo.delete({ id, ownerId });
    if (!result.affected) {
      throw new NotFoundException(`项目 ${id} 不存在`);
    }
  }
}
