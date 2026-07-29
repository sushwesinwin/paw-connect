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
    knowledgeDocument: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'knowledge-1',
          title: 'Persian Cat Grooming',
          category: 'grooming',
          content: 'Persian cats usually need daily brushing.',
          createdAt: new Date('2026-07-29T00:00:00.000Z'),
          updatedAt: new Date('2026-07-29T00:00:00.000Z'),
        },
      ]),
    },
    chatSession: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'session-1' }),
    },
    chatMessage: {
      create: jest.fn(),
    },
  };
  const originalApiKey = process.env.OPENROUTER_API_KEY;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.OPENROUTER_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Brush Persian cats daily.' } }],
      }),
    }) as jest.Mock;

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

  it('/knowledge/search (GET)', () => {
    return request(url)
      .get('/knowledge/search?q=persian')
      .expect(200)
      .expect((response) => {
        expect(response.body[0]).toEqual(
          expect.objectContaining({ title: 'Persian Cat Grooming' }),
        );
      });
  });

  it('/chat (POST)', () => {
    return request(url)
      .post('/chat')
      .send({ message: 'How often should I groom a Persian cat?' })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual({
          sessionId: 'session-1',
          answer: 'Brush Persian cats daily.',
          citations: [{ title: 'Persian Cat Grooming', category: 'grooming' }],
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(() => {
    process.env.OPENROUTER_API_KEY = originalApiKey;
  });
});
