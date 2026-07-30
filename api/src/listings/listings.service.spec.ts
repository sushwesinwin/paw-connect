import { BadRequestException } from '@nestjs/common';
import { ListingType } from '@prisma/client';
import { ListingsService } from './listings.service';

describe('ListingsService', () => {
  const prisma = {
    petListing: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const service = new ListingsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('searches listings by type and keyword', async () => {
    prisma.petListing.findMany.mockResolvedValue([]);

    await service.findAll({ type: ListingType.ADOPTION, q: 'milo' });

    expect(prisma.petListing.findMany).toHaveBeenCalledWith({
      where: {
        type: ListingType.ADOPTION,
        OR: [
          { petName: { contains: 'milo', mode: 'insensitive' } },
          { petType: { contains: 'milo', mode: 'insensitive' } },
          { breed: { contains: 'milo', mode: 'insensitive' } },
          { location: { contains: 'milo', mode: 'insensitive' } },
          { description: { contains: 'milo', mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('requires a contact method when creating a listing', () => {
    expect(() =>
      service.create({
        type: ListingType.LOST,
        petType: 'Dog',
        location: 'Bedok',
        description: 'Brown poodle',
        contactName: 'Sarah',
      }),
    ).toThrow(BadRequestException);
  });

  it('updates a listing', async () => {
    prisma.petListing.findUnique.mockResolvedValue({
      id: 'listing-1',
      type: ListingType.ADOPTION,
      petName: 'Milo',
      petType: 'Cat',
      breed: null,
      age: null,
      location: 'Tampines',
      description: 'Friendly cat',
      contactName: 'Su',
      contactPhone: null,
      contactEmail: 'su@example.com',
      imageUrl: null,
    });
    prisma.petListing.update.mockResolvedValue({ id: 'listing-1' });

    await service.update('listing-1', { location: 'Bedok' });

    expect(prisma.petListing.update).toHaveBeenCalledWith({
      where: { id: 'listing-1' },
      data: {
        type: ListingType.ADOPTION,
        petName: 'Milo',
        petType: 'Cat',
        breed: undefined,
        age: undefined,
        location: 'Bedok',
        description: 'Friendly cat',
        contactName: 'Su',
        contactPhone: undefined,
        contactEmail: 'su@example.com',
        imageUrl: undefined,
      },
    });
  });

  it('deletes a listing', async () => {
    prisma.petListing.findUnique.mockResolvedValue({ id: 'listing-1' });
    prisma.petListing.delete.mockResolvedValue({ id: 'listing-1' });

    await service.remove('listing-1');

    expect(prisma.petListing.delete).toHaveBeenCalledWith({
      where: { id: 'listing-1' },
    });
  });
});
