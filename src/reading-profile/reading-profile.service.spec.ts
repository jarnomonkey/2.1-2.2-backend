import { BadRequestException } from '@nestjs/common';
import { ReadingProfileService } from './reading-profile.service.js';

describe('ReadingProfileService', () => {
  const upsert = vi.fn();
  const prisma = {
    readingProfile: { upsert },
  };
  let service: ReadingProfileService;

  beforeEach(() => {
    vi.clearAllMocks();
    upsert.mockResolvedValue({ id: 'profile-1' });
    service = new ReadingProfileService(prisma as never);
  });

  it('normaliseert geldige voorkeuren voordat ze worden opgeslagen', async () => {
    await service.save('user-1', {
      readingLevel: 'NIVEAU_2F',
      genres: ['Fantasy', 'Fantasy', '  Mystery  '],
      topics: ['sport', 'sport'],
      lengthPref: 'KORT',
      readingGoal: 'ONTSPANNING',
    });

    expect(upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      create: {
        userId: 'user-1',
        readingLevel: 'NIVEAU_2F',
        genres: ['Fantasy', 'Mystery'],
        topics: ['sport'],
        lengthPref: 'KORT',
        readingGoal: 'ONTSPANNING',
      },
      update: {
        readingLevel: 'NIVEAU_2F',
        genres: ['Fantasy', 'Mystery'],
        topics: ['sport'],
        lengthPref: 'KORT',
        readingGoal: 'ONTSPANNING',
      },
    });
  });

  it('weigert een profiel zonder onderwerp af', async () => {
    await expect(
      service.save('user-1', {
        readingLevel: '2F',
        genres: [],
        topics: [' ', 42],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(upsert).not.toHaveBeenCalled();
  });

  it('weigert een ongeldig leesniveau en een ongeldige voorkeur', async () => {
    await expect(
      service.save('user-1', {
        readingLevel: 'beginner',
        topics: ['fantasy'],
        lengthPref: 'TOO_LONG',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(upsert).not.toHaveBeenCalled();
  });
});