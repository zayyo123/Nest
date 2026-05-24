import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

// 学习注释：CreateTaskDto 描述创建任务时允许提交的字段和校验规则。
export class CreateTaskDto {
  // 标题必填，1~80 字符。
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  title: string;

  // 描述可选，最多 240 字符。
  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  // 状态可选；如果传了，必须是 TaskStatus 枚举中的值。
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  // 优先级可选；如果不传，Service 会默认使用 MEDIUM。
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  // 截止日期可选；为了简化前端和数据库，这里要求 YYYY-MM-DD。
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '截止日期必须使用 YYYY-MM-DD 格式',
  })
  dueDate?: string | null;

  // projectId 可选；@Type(() => Number) 会把请求中的字符串数字转为 number。
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  projectId?: number | null;
}
