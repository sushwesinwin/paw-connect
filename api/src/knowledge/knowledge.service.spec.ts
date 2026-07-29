import { BadRequestException } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

describe('KnowledgeService', () => {
  const prisma = {
    knowledgeDocument: {
      findMany: jest.fn(),
    },
  };
  const service = new KnowledgeService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('searches knowledge documents by query', async () => {
    prisma.knowledgeDocument.findMany.mockResolvedValue([]);

    await service.search('persian');

    expect(prisma.knowledgeDocument.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { title: { contains: 'persian', mode: 'insensitive' } },
          { category: { contains: 'persian', mode: 'insensitive' } },
          { content: { contains: 'persian', mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('requires a query', () => {
    expect(() => service.search('   ')).toThrow(BadRequestException);
  });
});
