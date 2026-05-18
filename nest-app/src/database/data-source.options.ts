import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const commonOptions = {
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // Convenient for learning; production deployments should use migrations.
  synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  autoLoadEntities: true,
};

export const databaseOptions: TypeOrmModuleOptions = process.env.DB_HOST
  ? {
      ...commonOptions,
      type: 'mysql',
      host: process.env.DB_HOST,
      port: toNumber(process.env.DB_PORT, 3306),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'nestlearn',
      retryAttempts: toNumber(process.env.DB_RETRY_ATTEMPTS, 10),
      retryDelay: toNumber(process.env.DB_RETRY_DELAY, 3000),
    }
  : {
      ...commonOptions,
      type: 'sqljs',
      autoSave: false,
      location: process.env.DB_DATABASE || 'nestlearn.db',
    };
