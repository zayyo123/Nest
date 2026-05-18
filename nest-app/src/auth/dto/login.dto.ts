import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  // 登录邮箱必须是合法邮箱格式；全局 ValidationPipe 会在进入 Controller 前校验。
  @IsEmail()
  email: string;

  // 密码至少 6 位，和注册接口保持同一条基本规则。
  @IsString()
  @MinLength(6)
  password: string;
}
