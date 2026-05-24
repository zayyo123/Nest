import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// 学习注释：Controller 负责把 HTTP 请求映射到 TypeScript 方法。
// @Controller() 空字符串表示根路径；结合全局前缀后，这里是 GET /api。
@Controller()
export class AppController {
  // 通过构造函数注入 AppService，这是 Nest 常见的依赖注入写法。
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
