import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity()
@Index(['ownerId', 'name'])
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string | null;

  @Column({ default: '#2563eb' })
  color: string;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
