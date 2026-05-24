import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

// 学习注释：AuthModule 集中管理“账号认证”相关能力。
// 其他模块需要鉴权时，可以通过 exports 使用 JwtModule 和 JwtAuthGuard。
@Module({
  imports: [
    // forFeature([User]) 让 AuthService 可以注入 User 的 Repository。
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      // 学习阶段提供 dev-secret 兜底；正式环境必须通过 JWT_SECRET 配置强随机密钥。
      secret: process.env.JWT_SECRET || 'dev-secret',
      // token 1 天后过期；过期后 JwtAuthGuard 会返回 401，前端会跳回登录页。
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
