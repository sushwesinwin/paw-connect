import { BadRequestException } from '@nestjs/common';
import { ListingType } from '@prisma/client';
import { ListingsService } from './listings.service';

describe('ListingsService', () => {
  const prisma = {
    petListing: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };
  const service = new ListingsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('searches listings by type and keyword', async () => {
    prisma.petListing.findMany.mockResolvedValue([]);

    await service.findAll({ type: ListingType.ADOPTION, q: 'milo' });

    expect(prisma.petListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: ListingType.ADOPTION,
          OR: expect.any(Array),
        }),
      }),
    );
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
});
