import { Body, Controller, Get, Post } from '@nestjs/common';
import { ServiceType } from '@prisma/client';
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
}
