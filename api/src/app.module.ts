import { Module } from '@nestjs/common';
import { AppointmentsModule } from './appointments/appointments.module';
import { HealthModule } from './health/health.module';
import { ListingsModule } from './listings/listings.module';

@Module({
  imports: [HealthModule, ListingsModule, AppointmentsModule],
})
export class AppModule {}
