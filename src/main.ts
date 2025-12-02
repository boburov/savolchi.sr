import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 5000;

  await app.listen(port, () => {
    Logger.log(`Nest application is running on: http://localhost:${port}`);
  });
}

bootstrap();
