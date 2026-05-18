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
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private service: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'List all tasks' })
  @ApiResponse({ status: 200, type: [Task] })
  findAll(): Promise<Task[]> {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiResponse({ status: 201, type: Task })
  create(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiParam({ name: 'id', required: true, description: 'Task ID' })
  @ApiResponse({ status: 200, type: Task })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, type: Task })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
