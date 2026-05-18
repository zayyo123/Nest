import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    // Guard 会在 Controller 方法执行前运行。
    // 这里从当前 HTTP 请求中取出 Authorization 请求头，并解析 Bearer token。
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    // 没有 token 代表用户未登录，直接返回 401。
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      // verify 会同时做签名校验和过期时间校验。
      // 校验成功后，将 token 载荷写入 request.user，后续 @CurrentUser() 可以直接读取。
      request.user = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });
      return true;
    } catch {
      throw new UnauthorizedException('登录凭证无效，请重新登录');
    }
  }

  private extractToken(request: Request): string | undefined {
    // 标准格式是 Authorization: Bearer <token>。
    // split 后 type 应为 Bearer，token 是真正需要校验的 JWT 字符串。
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
