import { BadRequestException } from '@nestjs/common';
import { AppointmentStatus, ServiceType } from '@prisma/client';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  const prisma = {
    appointmentRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
      data: {
        serviceType: ServiceType.GROOMING,
        petName: 'Buddy',
        petType: 'Dog',
        preferredAt: new Date('2026-08-02T10:00:00.000Z'),
        contactName: 'Alex',
        contactPhone: '+65 9222 2222',
        contactEmail: undefined,
        notes: undefined,
      },
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

  it('updates appointment status', async () => {
    prisma.appointmentRequest.findUnique.mockResolvedValue({
      id: 'appointment-1',
      serviceType: ServiceType.GROOMING,
      petName: 'Buddy',
      petType: 'Dog',
      preferredAt: new Date('2026-08-02T10:00:00.000Z'),
      contactName: 'Alex',
      contactPhone: '+65 9222 2222',
      contactEmail: null,
      notes: null,
      status: AppointmentStatus.PENDING,
    });
    prisma.appointmentRequest.update.mockResolvedValue({ id: 'appointment-1' });

    await service.update('appointment-1', {
      status: AppointmentStatus.CONFIRMED,
    });

    expect(prisma.appointmentRequest.update).toHaveBeenCalledWith({
      where: { id: 'appointment-1' },
      data: {
        serviceType: ServiceType.GROOMING,
        petName: 'Buddy',
        petType: 'Dog',
        preferredAt: new Date('2026-08-02T10:00:00.000Z'),
        contactName: 'Alex',
        contactPhone: '+65 9222 2222',
        contactEmail: undefined,
        notes: undefined,
        status: AppointmentStatus.CONFIRMED,
      },
    });
  });

  it('deletes an appointment', async () => {
    prisma.appointmentRequest.findUnique.mockResolvedValue({
      id: 'appointment-1',
    });
    prisma.appointmentRequest.delete.mockResolvedValue({ id: 'appointment-1' });

    await service.remove('appointment-1');

    expect(prisma.appointmentRequest.delete).toHaveBeenCalledWith({
      where: { id: 'appointment-1' },
    });
  });
});
