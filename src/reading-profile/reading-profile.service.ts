import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  LengthPreference,
  ReadingGoal,
  ReadingLevel,
} from '../prisma/generated/prisma/client.js';

export type ReadingProfileInput = {
  readingLevel?: unknown;
  genres?: unknown;
  topics?: unknown;
  lengthPref?: unknown;
  readingGoal?: unknown;
};

@Injectable()
export class ReadingProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string) {
    return (
      (await this.prisma.readingProfile.findUnique({ where: { userId } })) ??
      null
    );
  }

  async save(userId: string, body: ReadingProfileInput) {
    const data = this.validate(body);
    return this.prisma.readingProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  private validate(body: ReadingProfileInput) {
    const errors: string[] = [];

    const readingLevel = this.oneOf(ReadingLevel, body?.readingLevel);
    if (!readingLevel) errors.push('readingLevel is verplicht of ongeldig');

    const lengthPref = this.oneOf(LengthPreference, body?.lengthPref);
    if (body?.lengthPref != null && !lengthPref) {
      errors.push('lengthPref is ongeldig');
    }

    const readingGoal = this.oneOf(ReadingGoal, body?.readingGoal);
    if (body?.readingGoal != null && !readingGoal) {
      errors.push('readingGoal is ongeldig');
    }

    const genres = this.stringList(body?.genres);

    const topics = this.stringList(body?.topics);
    if (!topics.length) errors.push('kies minimaal 1 onderwerp');

    if (errors.length) throw new BadRequestException(errors);

    return {
      readingLevel: readingLevel!,
      genres,
      topics,
      lengthPref,
      readingGoal,
    };
  }

  private oneOf<T extends Record<string, string>>(
    enumObj: T,
    value: unknown,
  ): T[keyof T] | null {
    return typeof value === 'string' &&
      (Object.values(enumObj) as string[]).includes(value)
      ? (value as T[keyof T])
      : null;
  }

  private stringList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return [
      ...new Set(
        value
          .filter((v): v is string => typeof v === 'string')
          .map((v) => v.trim())
          .filter(Boolean),
      ),
    ];
  }
}