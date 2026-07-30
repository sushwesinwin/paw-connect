import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AppointmentStatus, ServiceType } from '@prisma/client';
import { AppointmentsService } from './appointments.service';

type CreateAppointmentBody = {
  serviceType: ServiceType;
  petName: string;
  petType: string;
  preferredAt: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
};

type UpdateAppointmentBody = Partial<
  CreateAppointmentBody & { status: AppointmentStatus }
>;

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Post()
  create(@Body() body: CreateAppointmentBody) {
    return this.appointmentsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAppointmentBody) {
    return this.appointmentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
