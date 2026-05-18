import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() dto: any) {
    // Simple mock response with a token for teaching/demo purposes
    return { accessToken: 'dummy-token' };
  }

  @Post('login')
  login(@Body() dto: any) {
    // Simple mock response with a token for teaching/demo purposes
    return { accessToken: 'dummy-token' };
  }
}
