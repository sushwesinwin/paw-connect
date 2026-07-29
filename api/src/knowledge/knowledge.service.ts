import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  search(q?: string) {
    const query = q?.trim();
    if (!query) {
      throw new BadRequestException('q is required');
    }

    const where: Prisma.KnowledgeDocumentWhereInput = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    };

    return this.prisma.knowledgeDocument.findMany({
      where,
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
  }

  searchForContext(message: string, take = 4) {
    const terms = message
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length > 2)
      .slice(0, 8);

    if (terms.length === 0) {
      return [];
    }

    return this.prisma.knowledgeDocument.findMany({
      where: {
        OR: terms.flatMap((term) => [
          { title: { contains: term, mode: 'insensitive' as const } },
          { category: { contains: term, mode: 'insensitive' as const } },
          { content: { contains: term, mode: 'insensitive' as const } },
        ]),
      },
      take,
      orderBy: { updatedAt: 'desc' },
      select: {
        title: true,
        category: true,
        content: true,
      },
    });
  }
}
