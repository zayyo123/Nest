import {
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// 学习注释：DTO 描述“创建项目接口允许客户端提交什么字段，以及这些字段如何校验”。
export class CreateProjectDto {
  // 项目名必填，必须是字符串，长度 1~60。
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name: string;

  // description 可选；如果传了，就必须是字符串且不超过 200 字符。
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  // color 可选；如果传了，必须是 #2563eb 这样的十六进制颜色。
  @IsOptional()
  @IsHexColor()
  color?: string;
}
