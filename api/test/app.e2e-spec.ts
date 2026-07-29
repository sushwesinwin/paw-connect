import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppModule (e2e)', () => {
  let app: INestApplication<App>;
  let url: string;
  const prisma = {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    petListing: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation(({ data }) => ({
        id: 'listing-1',
        ...data,
      })),
    },
    appointmentRequest: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation(({ data }) => ({
        id: 'appointment-1',
        status: 'PENDING',
        ...data,
      })),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);
    url = await app.getUrl();
  });

  it('/health (GET)', () => {
    return request(url)
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', database: 'connected' });
  });

  it('/listings (GET)', () => {
    return request(url).get('/listings?type=ADOPTION').expect(200).expect([]);
  });

  it('/listings (POST)', () => {
    return request(url)
      .post('/listings')
      .send({
        type: 'LOST',
        petName: 'Cookie',
        petType: 'Dog',
        location: 'Bedok',
        description: 'Brown poodle',
        contactName: 'Sarah',
        contactPhone: '+65 9000 0000',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({ id: 'listing-1', type: 'LOST' }),
        );
      });
  });

  it('/appointments (POST)', () => {
    return request(url)
      .post('/appointments')
      .send({
        serviceType: 'GROOMING',
        petName: 'Buddy',
        petType: 'Dog',
        preferredAt: '2026-08-02T10:00:00.000Z',
        contactName: 'Alex',
        contactPhone: '+65 9222 2222',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({ id: 'appointment-1', status: 'PENDING' }),
        );
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
