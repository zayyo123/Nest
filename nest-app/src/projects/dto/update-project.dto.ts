import {
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// 学习注释：更新 DTO 中字段都是可选的，表示“只更新客户端传来的字段”。
export class UpdateProjectDto {
  // @IsOptional 让 PATCH/PUT 场景可以只传 name、description、color 中的一部分。
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
