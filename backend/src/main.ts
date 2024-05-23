import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix(process.env.GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
    }),
  );

  if (!existsSync(process.env.MINIO_BUCKET)) mkdirSync(process.env.MINIO_BUCKET);

  await app.listen(process.env.NODE_PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
