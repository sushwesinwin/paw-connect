import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let url: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) })
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

  afterEach(async () => {
    await app.close();
  });
});
