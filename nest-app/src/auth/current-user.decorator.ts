import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

// 学习注释：自定义参数装饰器，用法是 @CurrentUser() user: Express.User。
// 它把 request.user 取出来交给 Controller，避免每个接口都手写 request.user。
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Express.User => {
    // ExecutionContext 可以拿到当前 HTTP 请求对象。
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) {
      // 正常情况下 JwtAuthGuard 会先写入 request.user；没有则说明鉴权链路异常。
      throw new UnauthorizedException('Missing authenticated user');
    }

    return request.user;
  },
);
