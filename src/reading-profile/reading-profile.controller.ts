import {
  Body,
  Controller,
  Get,
  Put,
  ForbiddenException,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReadingProfileService } from './reading-profile.service.js';
import { SaveReadingProfileDto } from './reading-profile.dto.js';

type AuthedRequest = { user?: { sub: string; role?: string } };

@UseGuards(AuthGuard)
@Controller('reading-profile')
@ApiTags('reading-profile')
@ApiBearerAuth()
export class ReadingProfileController {
  constructor(private readonly service: ReadingProfileService) {}

  // GET /reading-profile/me  ->  je eigen profiel (of null)
  @Get('me')
  mine(@Req() req: AuthedRequest) {
    if (!req.user) throw new UnauthorizedException();
    this.assertNotTeacher(req);
    return this.service.getForUser(req.user.sub);
  }

  // PUT /reading-profile/me  ->  profiel opslaan of bijwerken
  @Put('me')
  save(@Req() req: AuthedRequest, @Body() body: SaveReadingProfileDto) {
    if (!req.user) throw new UnauthorizedException();
    this.assertNotTeacher(req);
    return this.service.save(req.user.sub, body);
  }

  private assertNotTeacher(req: AuthedRequest) {
    if (req.user?.role === 'DOCENT') {
      throw new ForbiddenException('Docenten hebben geen aanbevelingen');
    }
  }
}