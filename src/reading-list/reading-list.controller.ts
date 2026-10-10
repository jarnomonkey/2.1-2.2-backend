import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  ForbiddenException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ReadingListService } from './reading-list.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BookIdDto, ReadStatusDto } from './reading-list.dto.js';

// req.user wordt gevuld door de guard (het JWT-payload: { sub, email, role })
type AuthedRequest = { user?: { sub: string; role?: string } };

@UseGuards(AuthGuard)
@Controller('reading-list')
@ApiTags('reading-list')
@ApiBearerAuth()
export class ReadingListController {
  constructor(private readonly readingList: ReadingListService) {}

  // GET /reading-list  ->  je eigen leeslijst
  @Get()
  mine(@Req() req: AuthedRequest) {
    if (!req.user) throw new UnauthorizedException();
    this.assertNotTeacher(req);
    return this.readingList.getForUser(req.user.sub);
  }

  // GET /reading-list/all  ->  leeslijsten van alle studenten en cursisten (alleen docent)
  @Get('all')
  all(@Req() req: AuthedRequest) {
    if (!req.user) throw new UnauthorizedException();
    return this.readingList.getAllStudents(req.user.sub);
  }

  // GET /reading-list/ids  ->  alleen de boek-ID's van je leeslijst
  @Get('ids')
  ids(@Req() req: AuthedRequest) {
    if (!req.user) throw new UnauthorizedException();
    this.assertNotTeacher(req);
    return this.readingList.getIds(req.user.sub);
  }

  // POST /reading-list  met body { "bookId": "..." }  ->  boek op je leeslijst zetten
  @Post()
  add(@Req() req: AuthedRequest, @Body() body: BookIdDto) {
    if (!req.user) throw new UnauthorizedException();
    this.assertNotTeacher(req);
    return this.readingList.add(req.user.sub, body?.bookId);
  }

  // POST /reading-list/students/:userId met body { "bookId": "..." }
  @Post('students/:userId')
  addForStudent(
    @Req() req: AuthedRequest,
    @Param('userId') userId: string,
    @Body() body: BookIdDto,
  ) {
    if (!req.user) throw new UnauthorizedException();
    return this.readingList.addForStudent(req.user.sub, userId, body?.bookId);
  }

  // DELETE /reading-list/:bookId  ->  boek van je leeslijst halen
  @Delete(':bookId')
  remove(@Req() req: AuthedRequest, @Param('bookId') bookId: string) {
    if (!req.user) throw new UnauthorizedException();
    this.assertNotTeacher(req);
    return this.readingList.remove(req.user.sub, bookId);
  }

  // PATCH /reading-list/:bookId/read met body { "isRead": true|false }
  @Patch(':bookId/read')
  setReadStatus(
    @Req() req: AuthedRequest,
    @Param('bookId') bookId: string,
    @Body() body: ReadStatusDto,
  ) {
    if (!req.user) throw new UnauthorizedException();
    this.assertNotTeacher(req);
    return this.readingList.setReadStatus(req.user.sub, bookId, body?.isRead);
  }

  // GET /reading-list/students/:userId  ->  leeslijst van een student/cursist (alleen docent)
  @Get('students/:userId')
  forStudent(@Req() req: AuthedRequest, @Param('userId') userId: string) {
    if (!req.user) throw new UnauthorizedException();
    return this.readingList.getForStudent(req.user.sub, userId);
  }

  private assertNotTeacher(req: AuthedRequest) {
    if (req.user?.role === 'DOCENT') {
      throw new ForbiddenException('Docenten hebben geen persoonlijke leeslijst');
    }
  }
}
