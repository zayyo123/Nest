import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  // 用户显示名称必填，长度控制在 1~60，避免空名称或超长内容进入数据库。
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name: string;

  // 邮箱既是登录凭证，也是用户表中的唯一字段。
  @IsEmail()
  email: string;

  // 学习项目只做最基础长度校验；真实项目可继续增加复杂度规则。
  @IsString()
  @MinLength(6)
  password: string;
}
