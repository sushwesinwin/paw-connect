import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let healthController: HealthController;
  const prisma = {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('health', () => {
    it('should return ok status with database connection', async () => {
      await expect(healthController.getHealth()).resolves.toEqual({
        status: 'ok',
        database: 'connected',
      });
    });
  });
});
