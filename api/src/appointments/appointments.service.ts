import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, ServiceType } from '@prisma/client';
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

type UpdateAppointmentInput = Partial<
  CreateAppointmentInput & { status: AppointmentStatus }
>;

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

  async update(id: string, input: UpdateAppointmentInput) {
    const existing = await this.prisma.appointmentRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    const next = { ...existing, ...input };

    if (
      input.serviceType &&
      !Object.values(ServiceType).includes(input.serviceType)
    ) {
      throw new BadRequestException('Invalid service type');
    }

    if (
      input.status &&
      !Object.values(AppointmentStatus).includes(input.status)
    ) {
      throw new BadRequestException('Invalid appointment status');
    }

    requireText(next.petName, 'petName');
    requireText(next.petType, 'petType');
    requireText(String(next.preferredAt), 'preferredAt');
    requireText(next.contactName, 'contactName');

    if (!next.contactPhone?.trim() && !next.contactEmail?.trim()) {
      throw new BadRequestException('contactPhone or contactEmail is required');
    }

    const preferredAt = new Date(next.preferredAt);
    if (Number.isNaN(preferredAt.getTime())) {
      throw new BadRequestException('preferredAt must be a valid date');
    }

    return this.prisma.appointmentRequest.update({
      where: { id },
      data: {
        serviceType: next.serviceType,
        petName: next.petName.trim(),
        petType: next.petType.trim(),
        preferredAt,
        contactName: next.contactName.trim(),
        contactPhone: clean(next.contactPhone),
        contactEmail: clean(next.contactEmail),
        notes: clean(next.notes),
        status: next.status,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.appointmentRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.appointmentRequest.delete({ where: { id } });
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
