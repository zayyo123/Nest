// 学习注释：这是 TypeScript 的类型扩展文件。
// JwtAuthGuard 会把解析出的 JWT 载荷写到 request.user；
// 这里告诉 TS：Express.Request 上确实可能存在 user 字段。
declare namespace Express {
  export interface User {
    // sub 是 JWT 中常用的 subject 字段，这里存当前登录用户 ID。
    sub: number;
    email: string;
  }

  export interface Request {
    user?: User;
  }
}
