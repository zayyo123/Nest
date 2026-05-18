import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'simple-enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ nullable: true })
  projectId?: number;

  // Deleting a project keeps the task history and simply clears the association.
  @ManyToOne(() => Project, (project) => project.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'projectId' })
  project?: Project;
}
