import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';

// 登录和注册成功后统一返回的结构。
// accessToken 给前端放入 Authorization 请求头，user 给前端显示当前账号信息。
export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    // 注入 User Repository，用于查询用户、创建用户、判断邮箱是否重复。
    @InjectRepository(User) private readonly users: Repository<User>,
    // JwtService 负责签发 token；校验 token 的逻辑在 JwtAuthGuard 中。
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // 邮箱先 trim 再转小写，确保 Foo@Email.com 和 foo@email.com 被视为同一账号。
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email } });

    // 如果邮箱已经存在，抛出 409 Conflict，比普通 400 更能表达“资源冲突”。
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }

    // bcrypt.hash 的第二个参数是 salt rounds。
    // 这里使用 10 是学习项目中常见的折中值：比明文安全，又不会让本地开发明显变慢。
    const user = await this.users.save(
      this.users.create({
        name: dto.name.trim(),
        email,
        passwordHash: await bcrypt.hash(dto.password, 10),
      }),
    );

    return this.authResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    // 登录时使用和注册相同的邮箱规范化规则，避免大小写导致“注册了但登录不上”。
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findOne({ where: { email } });

    // 不区分“邮箱不存在”和“密码错误”，可以减少账号枚举风险。
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    return this.authResponse(user);
  }

  private authResponse(user: User): AuthResponse {
    // JWT 载荷只放最小必要信息：
    // - sub: 标准字段，表示当前登录用户 ID。
    // - email: 便于后续日志或简单展示，但不把密码哈希等敏感字段放进去。
    return {
      accessToken: this.jwtService.sign({ sub: user.id, email: user.email }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
