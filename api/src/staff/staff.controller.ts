import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StaffRole, StaffStatus } from '@prisma/client';
import { StaffService } from './staff.service';

type StaffBody = {
  name: string;
  role: StaffRole;
  specialty: string;
  availableDays: string[];
  startTime: string;
  endTime: string;
  status?: StaffStatus;
};

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Post()
  create(@Body() body: StaffBody) {
    return this.staffService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<StaffBody>) {
    return this.staffService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
