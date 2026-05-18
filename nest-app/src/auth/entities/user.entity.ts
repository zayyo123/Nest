import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // 用户展示名称，前端导航栏会优先显示这个字段。
  @Column()
  name: string;

  // 邮箱唯一，注册时依赖这个约束和业务校验防止重复账号。
  @Column({ unique: true })
  email: string;

  // 保存 bcrypt 哈希后的密码，不保存明文密码。
  @Column()
  passwordHash: string;
}
