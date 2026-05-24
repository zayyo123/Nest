import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

// 学习注释：用 enum 固定任务状态，前后端都使用这些稳定字符串。
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// 学习注释：优先级同样用 enum，避免数据库里出现 high/HIGH/重要 等混乱值。
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// 学习注释：Task 实体会被 TypeORM 映射成任务表。
@Entity()
// 按 ownerId + status / priority 建索引，适合后续扩展按状态或优先级筛选。
@Index(['ownerId', 'status'])
@Index(['ownerId', 'priority'])
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  // 标题必填，长度由 DTO 控制。
  @Column()
  title: string;

  // 描述可为空，前端会显示“暂无描述”。
  @Column({ nullable: true })
  description?: string | null;

  // simple-enum 适合教学项目，直接把枚举值以字符串形式保存到数据库。
  @Column({ type: 'simple-enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({
    type: 'simple-enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  // 截止日期用 YYYY-MM-DD 字符串保存，前端比较和展示都比较简单。
  @Column({ nullable: true })
  dueDate?: string | null;

  // projectId 是外键字段；允许为空表示任务可以不关联项目。
  @Column({ nullable: true })
  projectId?: number | null;

  // 多个任务可以属于同一个项目；项目删除时，任务保留但 projectId 置空。
  @ManyToOne(() => Project, (project) => project.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'projectId' })
  project?: Project | null;
}
