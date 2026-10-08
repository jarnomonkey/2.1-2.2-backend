import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum MaterialType {
  Book = 'Book',
  NewspaperArticle = 'NewspaperArticle',
  Magazine = 'Magazine',
  OnlineArticle = 'OnlineArticle',
  PoetryBundle = 'PoetryBundle',
  BlogPost = 'BlogPost',
}

// Let op: elke waarde is nu expliciet een string. In je originele versie
// kregen de leden automatisch de waarden 0, 1 en 2.
export enum ReadingLevel {
  F2 = '2F',
  F3 = '3F',
  F3Plus = '3F+',
}

@Schema({ collection: 'books' })
export class Book {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  author: string;

  @Prop({ type: [String], default: [] })
  genre: string[];

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  imageUrl?: string;

  @Prop({
    type: [{ type: String, enum: Object.values(ReadingLevel) }],
    default: [],
  })
  readingLevel: ReadingLevel[];

  @Prop({ type: [String], index: true, default: [] })
  tags: string[];

  @Prop({
    type: String,
    enum: Object.values(MaterialType),
    required: true,
  })
  materialType: MaterialType;

  @Prop({ type: String })
  sourceUrl?: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
