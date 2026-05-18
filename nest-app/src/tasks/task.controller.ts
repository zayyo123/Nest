import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';

@ApiTags('任务')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private service: TaskService) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户的任务列表' })
  @ApiResponse({ status: 200, type: [Task] })
  findAll(@CurrentUser() user: Express.User): Promise<Task[]> {
    return this.service.findAll(user.sub);
  }

  @Post()
  @ApiOperation({ summary: '为当前用户创建任务' })
  @ApiResponse({ status: 201, type: Task })
  create(
    @CurrentUser() user: Express.User,
    @Body() dto: CreateTaskDto,
  ): Promise<Task> {
    return this.service.create(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取当前用户的单个任务' })
  @ApiParam({ name: 'id', required: true, description: '任务 ID' })
  @ApiResponse({ status: 200, type: Task })
  findOne(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Task> {
    return this.service.findOne(user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新当前用户的任务' })
  @ApiResponse({ status: 200, type: Task })
  update(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.service.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '删除当前用户的任务' })
  @ApiResponse({ status: 204 })
  remove(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.service.remove(user.sub, id);
  }
}
