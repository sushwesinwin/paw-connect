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
}
