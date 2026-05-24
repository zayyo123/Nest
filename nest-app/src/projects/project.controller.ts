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
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@ApiTags('项目')
@ApiBearerAuth()
// 学习注释：类级别使用 Guard 后，本控制器所有接口都必须带 Bearer token。
@UseGuards(JwtAuthGuard)
// @Controller('projects') 加上全局前缀 api，最终路径是 /api/projects。
@Controller('projects')
export class ProjectsController {
  constructor(private service: ProjectService) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户的项目列表' })
  @ApiResponse({ status: 200, type: [Project] })
  findAll(@CurrentUser() user: Express.User): Promise<Project[]> {
    // user.sub 来自 JWT 载荷，表示当前登录用户 ID；Service 用它做数据隔离。
    return this.service.findAll(user.sub);
  }

  @Post()
  @ApiOperation({ summary: '为当前用户创建项目' })
  @ApiResponse({ status: 201, type: Project })
  create(
    @CurrentUser() user: Express.User,
    // @Body() 会读取请求体，并由全局 ValidationPipe 按 CreateProjectDto 校验。
    @Body() dto: CreateProjectDto,
  ): Promise<Project> {
    return this.service.create(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取当前用户的单个项目' })
  @ApiParam({ name: 'id', required: true, description: '项目 ID' })
  @ApiResponse({ status: 200, type: Project })
  findOne(
    @CurrentUser() user: Express.User,
    // ParseIntPipe 把 URL 中的字符串 id 转成 number；无法转换会自动返回 400。
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Project> {
    return this.service.findOne(user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新当前用户的项目' })
  @ApiResponse({ status: 200, type: Project })
  update(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project> {
    return this.service.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '删除当前用户的项目' })
  @ApiResponse({ status: 204 })
  remove(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.service.remove(user.sub, id);
  }
}
