import {
  Delete,
  Get,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { UsersService } from './users.service.js';

type AuthedRequest = { user?: { sub: string } };

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('teachers')
  getTeachers() {
    return this.usersService.getTeachers();
  }

  @Get('me/teacher')
  getTeacher(@Req() req: AuthedRequest) {
    if (!req.user) throw new UnauthorizedException();
    return this.usersService.getTeacher(req.user.sub);
  }

  @Put('me/teacher/:teacherId')
  connectToTeacher(@Req() req: AuthedRequest, @Param('teacherId') teacherId: string) {
    if (!req.user) throw new UnauthorizedException();
    return this.usersService.connectToTeacher(req.user.sub, teacherId);
  }

  @Delete('me/teacher')
  disconnectFromTeacher(@Req() req: AuthedRequest) {
    if (!req.user) throw new UnauthorizedException();
    return this.usersService.disconnectFromTeacher(req.user.sub);
  }
}