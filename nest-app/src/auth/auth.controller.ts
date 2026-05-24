import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// 学习注释：@Controller('auth') 表示本控制器下所有路由都以 /api/auth 开头。
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/register：注册接口，请求体会先经过 RegisterDto 校验。
  @Post('register')
  // 默认 POST 成功是 201；这里返回 200 是为了和登录接口响应风格保持一致。
  @HttpCode(200)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/auth/login：登录接口，成功后返回 accessToken 和用户基础信息。
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
