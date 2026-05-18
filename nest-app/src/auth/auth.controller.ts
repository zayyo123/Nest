import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() dto: any) {
    void dto;
    // Teaching demo only: replace this with user persistence and JWT signing in real auth.
    return { accessToken: 'dummy-token' };
  }

  @Post('login')
  login(@Body() dto: any) {
    void dto;
    // The frontend only needs a token-shaped value to exercise protected routes.
    return { accessToken: 'dummy-token' };
  }
}
