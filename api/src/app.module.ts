import { Module } from '@nestjs/common';
import { AppointmentsModule } from './appointments/appointments.module';
import { ChatModule } from './chat/chat.module';
import { HealthModule } from './health/health.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { ListingsModule } from './listings/listings.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [
    HealthModule,
    ListingsModule,
    AppointmentsModule,
    StaffModule,
    KnowledgeModule,
    ChatModule,
  ],
})
export class AppModule {}
