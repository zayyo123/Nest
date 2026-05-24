import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

// 学习注释：Entity 类会被 TypeORM 映射成数据库表。
@Entity()
// 给 ownerId + name 建索引，加快“按用户查项目/按名称排序或搜索”的常见查询。
@Index(['ownerId', 'name'])
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  // ownerId 表示这个项目属于哪个用户，是多用户数据隔离的关键字段。
  @Column()
  ownerId: number;

  // 项目名称必填，长度由 DTO 负责校验。
  @Column()
  name: string;

  // nullable 表示数据库允许为空；前端会把空描述展示为“暂无描述”。
  @Column({ nullable: true })
  description?: string | null;

  // 每个项目有一个颜色，用于前端卡片和任务标签展示。
  @Column({ default: '#2563eb' })
  color: string;

  // 一个项目可以关联多个任务；这是 Project -> Task 的一对多关系。
  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
