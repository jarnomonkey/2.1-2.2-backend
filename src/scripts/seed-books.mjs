// scripts/seed-books.mjs
// Voegt de boeken uit scripts/books.json toe aan MongoDB.
//
// Gebruik (vanuit de hoofdmap van je project, waar je .env staat):
//   node scripts/seed-books.mjs            -> voegt toe (stopt als er al boeken staan)
//   node scripts/seed-books.mjs --reset    -> wist eerst de collectie 'books' en voegt dan toe

import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mongoose, { Schema } from 'mongoose';

// Houd dit gelijk aan src/books/book.schema.ts
const MATERIAL_TYPES = [
  'Book',
  'NewspaperArticle',
  'Magazine',
  'OnlineArticle',
  'PoetryBundle',
  'BlogPost',
];
const READING_LEVELS = ['2F', '3F', '3F+'];

const bookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: [String], default: [] },
  description: String,
  imageUrl: String,
  readingLevel: {
    type: [{ type: String, enum: READING_LEVELS }],
    default: [],
  },
  tags: { type: [String], index: true, default: [] },
  materialType: { type: String, enum: MATERIAL_TYPES, required: true },
  sourceUrl: String,
});

const Book = mongoose.model('Book', bookSchema, 'books');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    'MONGODB_URI is leeg. Draai dit script vanuit de projectmap waar je .env staat.',
  );
  process.exit(1);
}

const reset = process.argv.includes('--reset');
const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'books.json',
);
const books = JSON.parse(await readFile(file, 'utf8'));

await mongoose.connect(uri);
try {
  await Book.init(); // maakt de collectie en de index op 'tags' aan

  const existing = await Book.countDocuments();
  if (existing > 0 && !reset) {
    console.error(
      `De collectie 'books' bevat al ${existing} documenten. ` +
        'Gebruik --reset om eerst te wissen, of laat het zo.',
    );
    process.exitCode = 1;
  } else {
    if (reset) {
      const { deletedCount } = await Book.deleteMany({});
      console.log(`${deletedCount} bestaande documenten gewist.`);
    }
    const inserted = await Book.insertMany(books);
    console.log(`Klaar: ${inserted.length} items toegevoegd aan 'books'.`);
  }
} catch (err) {
  console.error('Mislukt:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
