import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

// 学习注释：bootstrap 是 NestJS 应用的启动函数。
// 后端启动时会先创建应用实例，再配置全局规则，最后监听端口。
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  // AppModule 是根模块，里面导入了认证、项目、任务、健康检查等功能模块。
  const app = await NestFactory.create(AppModule);

  // 全局前缀设置为 api，因此 Controller('projects') 最终路径是 /api/projects。
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      // 请求体出现 DTO 没声明的字段时直接报错，防止多余数据偷偷进入业务逻辑。
      forbidNonWhitelisted: true,
      // transform 会把可转换的参数转成目标类型，例如字符串 id 转 number。
      transform: true,
      // whitelist 会自动移除 DTO 中没有声明的字段。
      whitelist: true,
    }),
  );

  app.enableCors({
    // CORS_ORIGIN 支持逗号分隔多个前端地址；没配置时学习环境默认放开。
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  // Swagger 会根据 Controller、DTO、装饰器生成接口文档，便于浏览器调试 API。
  const config = new DocumentBuilder()
    .setTitle('任务管理系统 API')
    .setDescription('项目、任务和账号管理接口文档。')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  try {
    // 启动时写入演示账号和演示数据，方便初学者不用手动造数据。
    const seed = app.get(SeedService);
    await seed.seedIfNeeded();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Seed skipped: ${message}`);
  }

  // PORT 来自环境变量；没有配置时默认 3000。
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
