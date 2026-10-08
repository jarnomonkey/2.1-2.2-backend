
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("login")
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('register')
  register(@Body() body: { email?: string; name?: string; password?: string; role?: string }) {
  return this.authService.register(body);
  }
  
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req:any) {
      return this.authService.getProfile(req.user.sub);
  }
}
