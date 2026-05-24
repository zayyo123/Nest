import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 学习注释：这是一个最小单元测试示例。
// 它不启动真实 HTTP 服务，只创建测试模块并直接调用 Controller 方法。
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    // Test.createTestingModule 可以创建一个只包含本测试所需依赖的小型 Nest 容器。
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // 这里验证 Controller 会通过 Service 返回预期字符串。
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
