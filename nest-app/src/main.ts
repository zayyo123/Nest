import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Keep all REST endpoints under /api so the frontend can proxy one path.
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  // Swagger stays outside the /api prefix for a short, memorable docs URL.
  const config = new DocumentBuilder()
    .setTitle('Nest Project Manager API')
    .setDescription('Project and task management API documentation.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  try {
    const seed = app.get(SeedService);
    await seed.seedIfNeeded();
  } catch (error) {
    console.warn('Seed skipped:', error);
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
