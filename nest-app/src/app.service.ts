import { Injectable } from '@nestjs/common';

// 学习注释：@Injectable 标记这个类可以被 Nest 容器管理和注入。
// Service 通常放业务逻辑，Controller 只负责接收请求和返回结果。
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
