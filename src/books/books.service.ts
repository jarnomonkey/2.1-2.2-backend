import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Book } from './book.schema.js';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
  ) {}

  findAll() {
    return this.bookModel.find().lean();
  }

  // Haalt meerdere boeken op aan de hand van hun _id's (als tekst).
  // Ongeldige ID's worden overgeslagen, zodat één kapot ID de lijst niet breekt.
  findByIds(ids: string[]) {
    const valid = ids.filter((id) => isValidObjectId(id));
    return this.bookModel.find({ _id: { $in: valid } }).lean();
  }

  create(data: Partial<Book>) {
    return this.bookModel.create(data);
  }
}
