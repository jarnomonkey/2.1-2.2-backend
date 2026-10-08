import { Body, Controller, Get, Post } from '@nestjs/common';
import { BooksService } from './books.service.js';
import { Book } from './book.schema.js';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  

  @Post()
  create(@Body() body: Partial<Book>) {
    return this.booksService.create(body);
  }
}
