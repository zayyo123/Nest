declare namespace Express {
  export interface User {
    sub: number;
    email: string;
  }

  export interface Request {
    user?: User;
  }
}
