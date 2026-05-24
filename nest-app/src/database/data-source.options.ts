import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// 学习注释：环境变量读出来都是字符串；数据库端口、重试次数需要转成 number。
const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// 学习注释：databaseOptions 是 TypeORM 的数据库连接配置。
// AppModule 中的 TypeOrmModule.forRoot(databaseOptions) 会读取这里。
export const databaseOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  // 下面这些值优先读 .env，没有配置时使用适合本地学习的默认值。
  host: process.env.DB_HOST || 'localhost',
  port: toNumber(process.env.DB_PORT, 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'nestlearn',
  // 自动扫描所有 *.entity.ts / *.entity.js 文件，作为数据库表映射。
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // synchronize 会根据实体自动同步表结构；学习阶段方便，生产环境要关闭并改用迁移。
  synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  autoLoadEntities: true,
  retryAttempts: toNumber(process.env.DB_RETRY_ATTEMPTS, 10),
  retryDelay: toNumber(process.env.DB_RETRY_DELAY, 3000),
};
