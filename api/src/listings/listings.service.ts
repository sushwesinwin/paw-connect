import { BadRequestException, Injectable } from '@nestjs/common';
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
      where.location = { contains: filters.location.trim(), mode: 'insensitive' };
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
}

function requireText(value: string | undefined, field: string) {
  if (!value?.trim()) {
    throw new BadRequestException(`${field} is required`);
  }
}

function clean(value: string | undefined) {
  return value?.trim() || undefined;
}
