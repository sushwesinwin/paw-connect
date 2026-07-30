import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateListingInput = {
  type: ListingType;
  petName?: string;
  petType: string;
  breed?: string;
  age?: string;
  location: string;
  description: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  imageUrl?: string;
};

type UpdateListingInput = Partial<CreateListingInput>;

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { type?: ListingType; q?: string; location?: string }) {
    const where: Prisma.PetListingWhereInput = {};

    if (filters.type) {
      if (!Object.values(ListingType).includes(filters.type)) {
        throw new BadRequestException('Invalid listing type');
      }
      where.type = filters.type;
    }

    if (filters.location?.trim()) {
      where.location = {
        contains: filters.location.trim(),
        mode: 'insensitive',
      };
    }

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { petName: { contains: q, mode: 'insensitive' } },
        { petType: { contains: q, mode: 'insensitive' } },
        { breed: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.petListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  create(input: CreateListingInput) {
    if (!Object.values(ListingType).includes(input.type)) {
      throw new BadRequestException('Invalid listing type');
    }

    requireText(input.petType, 'petType');
    requireText(input.location, 'location');
    requireText(input.description, 'description');
    requireText(input.contactName, 'contactName');

    if (!input.contactPhone?.trim() && !input.contactEmail?.trim()) {
      throw new BadRequestException('contactPhone or contactEmail is required');
    }

    return this.prisma.petListing.create({
      data: {
        type: input.type,
        petName: clean(input.petName),
        petType: input.petType.trim(),
        breed: clean(input.breed),
        age: clean(input.age),
        location: input.location.trim(),
        description: input.description.trim(),
        contactName: input.contactName.trim(),
        contactPhone: clean(input.contactPhone),
        contactEmail: clean(input.contactEmail),
        imageUrl: clean(input.imageUrl),
      },
    });
  }

  async update(id: string, input: UpdateListingInput) {
    const existing = await this.prisma.petListing.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Listing not found');
    }

    const next = { ...existing, ...input };

    if (input.type && !Object.values(ListingType).includes(input.type)) {
      throw new BadRequestException('Invalid listing type');
    }

    requireText(next.petType, 'petType');
    requireText(next.location, 'location');
    requireText(next.description, 'description');
    requireText(next.contactName, 'contactName');

    if (!next.contactPhone?.trim() && !next.contactEmail?.trim()) {
      throw new BadRequestException('contactPhone or contactEmail is required');
    }

    return this.prisma.petListing.update({
      where: { id },
      data: {
        type: next.type,
        petName: clean(next.petName),
        petType: next.petType.trim(),
        breed: clean(next.breed),
        age: clean(next.age),
        location: next.location.trim(),
        description: next.description.trim(),
        contactName: next.contactName.trim(),
        contactPhone: clean(next.contactPhone),
        contactEmail: clean(next.contactEmail),
        imageUrl: clean(next.imageUrl),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.petListing.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Listing not found');
    }

    return this.prisma.petListing.delete({ where: { id } });
  }
}

function requireText(value: string | null | undefined, field: string) {
  if (!value?.trim()) {
    throw new BadRequestException(`${field} is required`);
  }
}

function clean(value: string | null | undefined) {
  return value?.trim() || undefined;
}
