import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const databaseOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: toNumber(process.env.DB_PORT, 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'nestlearn',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  autoLoadEntities: true,
  retryAttempts: toNumber(process.env.DB_RETRY_ATTEMPTS, 10),
  retryDelay: toNumber(process.env.DB_RETRY_DELAY, 3000),
};
