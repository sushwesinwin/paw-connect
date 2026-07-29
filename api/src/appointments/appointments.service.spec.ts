import { BadRequestException } from '@nestjs/common';
import { ServiceType } from '@prisma/client';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  const prisma = {
    appointmentRequest: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };
  const service = new AppointmentsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a pending appointment request', async () => {
    prisma.appointmentRequest.create.mockResolvedValue({ id: 'appointment-1' });

    await service.create({
      serviceType: ServiceType.GROOMING,
      petName: 'Buddy',
      petType: 'Dog',
      preferredAt: '2026-08-02T10:00:00.000Z',
      contactName: 'Alex',
      contactPhone: '+65 9222 2222',
    });

    expect(prisma.appointmentRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        serviceType: ServiceType.GROOMING,
        petName: 'Buddy',
      }),
    });
  });

  it('rejects invalid appointment dates', () => {
    expect(() =>
      service.create({
        serviceType: ServiceType.VET,
        petName: 'Luna',
        petType: 'Cat',
        preferredAt: 'not-a-date',
        contactName: 'Sarah',
        contactEmail: 'sarah@example.com',
      }),
    ).toThrow(BadRequestException);
  });
});
