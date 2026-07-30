import './env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin(origin, callback) {
      if (
        !origin ||
        origin === process.env.FRONTEND_URL ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
