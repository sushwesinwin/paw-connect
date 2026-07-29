import { BadRequestException, Injectable } from '@nestjs/common';
import { ServiceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateAppointmentInput = {
  serviceType: ServiceType;
  petName: string;
  petType: string;
  preferredAt: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
};

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.appointmentRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(input: CreateAppointmentInput) {
    if (!Object.values(ServiceType).includes(input.serviceType)) {
      throw new BadRequestException('Invalid service type');
    }

    requireText(input.petName, 'petName');
    requireText(input.petType, 'petType');
    requireText(input.preferredAt, 'preferredAt');
    requireText(input.contactName, 'contactName');

    if (!input.contactPhone?.trim() && !input.contactEmail?.trim()) {
      throw new BadRequestException('contactPhone or contactEmail is required');
    }

    const preferredAt = new Date(input.preferredAt);
    if (Number.isNaN(preferredAt.getTime())) {
      throw new BadRequestException('preferredAt must be a valid date');
    }

    return this.prisma.appointmentRequest.create({
      data: {
        serviceType: input.serviceType,
        petName: input.petName.trim(),
        petType: input.petType.trim(),
        preferredAt,
        contactName: input.contactName.trim(),
        contactPhone: clean(input.contactPhone),
        contactEmail: clean(input.contactEmail),
        notes: clean(input.notes),
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
