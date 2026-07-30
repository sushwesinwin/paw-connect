import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StaffRole, StaffStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type StaffInput = {
  name: string;
  role: StaffRole;
  specialty: string;
  availableDays: string[];
  startTime: string;
  endTime: string;
  status?: StaffStatus;
};

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.staffMember.findMany({
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  findAvailable(role?: StaffRole) {
    return this.prisma.staffMember.findMany({
      where: {
        role,
        status: StaffStatus.AVAILABLE,
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  create(input: StaffInput) {
    const data = validateStaff(input);

    return this.prisma.staffMember.create({ data });
  }

  async update(id: string, input: Partial<StaffInput>) {
    const existing = await this.prisma.staffMember.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Staff member not found');
    }

    const data = validateStaff({ ...existing, ...input });

    return this.prisma.staffMember.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.staffMember.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Staff member not found');
    }

    return this.prisma.staffMember.delete({ where: { id } });
  }
}

function validateStaff(input: StaffInput) {
  if (!Object.values(StaffRole).includes(input.role)) {
    throw new BadRequestException('Invalid staff role');
  }

  if (input.status && !Object.values(StaffStatus).includes(input.status)) {
    throw new BadRequestException('Invalid staff status');
  }

  requireText(input.name, 'name');
  requireText(input.specialty, 'specialty');
  requireText(input.startTime, 'startTime');
  requireText(input.endTime, 'endTime');

  const availableDays = input.availableDays
    .map((day) => day.trim())
    .filter(Boolean);

  if (!availableDays.length) {
    throw new BadRequestException('availableDays is required');
  }

  return {
    name: input.name.trim(),
    role: input.role,
    specialty: input.specialty.trim(),
    availableDays,
    startTime: input.startTime.trim(),
    endTime: input.endTime.trim(),
    status: input.status ?? StaffStatus.AVAILABLE,
  };
}

function requireText(value: string | undefined, field: string) {
  if (!value?.trim()) {
    throw new BadRequestException(`${field} is required`);
  }
}
