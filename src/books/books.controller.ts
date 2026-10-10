import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBookDto } from './book.dto.js';

type AuthedRequest = { user?: { role?: string } };

@Controller('books')
@ApiTags('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Req() req: AuthedRequest, @Body() body: CreateBookDto) {
    if (!req.user) throw new UnauthorizedException();
    if (req.user.role !== 'DOCENT') {
      throw new ForbiddenException('Alleen docenten mogen boeken toevoegen');
    }
    return this.booksService.create(body);
  }
}
