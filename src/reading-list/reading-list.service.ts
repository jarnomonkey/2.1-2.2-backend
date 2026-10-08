import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { PrismaService } from '../prisma/prisma.service.js';
import { BooksService } from '../books/books.service.js';
import { Role } from '../prisma/generated/prisma/client.js';

@Injectable()
export class ReadingListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly booksService: BooksService,
  ) {}

  // Leeslijst van één gebruiker, met de volledige boekgegevens uit MongoDB
  async getForUser(userId: string) {
    await this.assertCanUseOwnReadingList(userId);

    const items = await this.prisma.readingListItem.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });

    const books = await this.booksService.findByIds(items.map((i) => i.bookId));
    const byId = new Map(books.map((b) => [String(b._id), b]));

    return items.map((item) => ({
      bookId: item.bookId,
      addedAt: item.addedAt,
      isRead: item.isRead,
      // null als het boek inmiddels niet meer in MongoDB staat
      book: byId.get(item.bookId) ?? null,
    }));
  }

  // Alleen de boek-ID's op de leeslijst (licht, voor "al opgeslagen"-knoppen)
  async getIds(userId: string) {
    await this.assertCanUseOwnReadingList(userId);

    const items = await this.prisma.readingListItem.findMany({
      where: { userId },
      select: { bookId: true },
    });
    return items.map((i) => i.bookId);
  }

  // Zet een boek op de leeslijst van de gebruiker.
  // Twee keer toevoegen geeft geen fout en geen dubbele regel (upsert).
  async add(userId: string, bookId: unknown) {
    await this.assertCanUseOwnReadingList(userId);

    return this.addToList(userId, bookId);
  }

  // Een docent zet een boek op de leeslijst van een gekoppelde student.
  async addForStudent(requesterId: string, studentId: string, bookId: unknown) {
    await this.assertDocent(requesterId);

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { role: true, teacherId: true },
    });
    if (
      !student ||
      student.role === Role.DOCENT ||
      student.teacherId !== requesterId
    ) {
      throw new NotFoundException('Student of cursist niet gevonden');
    }

    return this.addToList(studentId, bookId);
  }

  private async addToList(userId: string, bookId: unknown) {

    if (typeof bookId !== 'string' || !isValidObjectId(bookId)) {
      throw new BadRequestException('Ongeldig boek-ID');
    }

    // Controleer in MongoDB dat het boek echt bestaat
    const found = await this.booksService.findByIds([bookId]);
    if (found.length === 0) {
      throw new NotFoundException('Boek niet gevonden');
    }

    const item = await this.prisma.readingListItem.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId },
      update: {},
    });

    return { bookId: item.bookId, addedAt: item.addedAt, isRead: item.isRead };
  }

  // Zet de leesstatus van een boek op de leeslijst.
  async setReadStatus(userId: string, bookId: string, isRead: unknown) {
    await this.assertCanUseOwnReadingList(userId);

    if (typeof isRead !== 'boolean') {
      throw new BadRequestException('isRead moet true of false zijn');
    }

    const result = await this.prisma.readingListItem.updateMany({
      where: { userId, bookId },
      data: { isRead },
    });

    if (result.count === 0) {
      throw new NotFoundException('Boek staat niet op de leeslijst');
    }

    return { bookId, isRead };
  }

  // Haalt een boek van de leeslijst van de gebruiker (ook goed als het er niet op staat)
  async remove(userId: string, bookId: string) {
    await this.assertCanUseOwnReadingList(userId);

    const { count } = await this.prisma.readingListItem.deleteMany({
      where: { userId, bookId },
    });
    return { bookId, removed: count > 0 };
  }

  private async assertCanUseOwnReadingList(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role === Role.DOCENT) {
      throw new ForbiddenException('Docenten hebben geen eigen leeslijst');
    }
  }

  // Controleert in de database (niet in het token) dat de aanvrager docent is
  private async assertDocent(requesterId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });
    if (requester?.role !== Role.DOCENT) {
      throw new ForbiddenException(
        'Alleen docenten mogen de leeslijsten van studenten bekijken',
      );
    }
  }

  // Een docent bekijkt alleen de leeslijsten van gekoppelde studenten en cursisten
  async getAllStudents(requesterId: string) {
    await this.assertDocent(requesterId);

    const students = await this.prisma.user.findMany({
      where: { role: { not: Role.DOCENT }, teacherId: requesterId },
      orderBy: { name: 'asc' },
      include: { readingList: { orderBy: { addedAt: 'desc' } } },
    });

    // Alle boeken in één keer ophalen in plaats van één query per student
    const allBookIds = [
      ...new Set(students.flatMap((s) => s.readingList.map((i) => i.bookId))),
    ];
    const books = await this.booksService.findByIds(allBookIds);
    const byId = new Map(books.map((b) => [String(b._id), b]));

    return students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      readingList: s.readingList.map((item) => ({
        bookId: item.bookId,
        addedAt: item.addedAt,
        isRead: item.isRead,
        book: byId.get(item.bookId) ?? null,
      })),
    }));
  }

  // Een docent bekijkt de leeslijst van een student of cursist
  async getForStudent(requesterId: string, studentId: string) {
    await this.assertDocent(requesterId);

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });
    if (
      !student ||
      student.role === Role.DOCENT ||
      student.teacherId !== requesterId
    ) {
      throw new NotFoundException('Student of cursist niet gevonden');
    }

    return {
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
      },
      readingList: await this.getForUser(student.id),
    };
  }
}
