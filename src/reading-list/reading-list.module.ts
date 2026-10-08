import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module.js';
import { ReadingListController } from './reading-list.controller.js';
import { ReadingListService } from './reading-list.service.js';

@Module({
  imports: [BooksModule], // BooksModule exporteert BooksService
  controllers: [ReadingListController],
  providers: [ReadingListService],
})
export class ReadingListModule {}
