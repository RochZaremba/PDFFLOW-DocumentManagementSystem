import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:4200', // URL frontendu
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  // Globalna walidacja DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // usuwa pola nie zdefiniowane w DTO
      forbidNonWhitelisted: true, // zwraca błąd przy nieznanych polach
      transform: true, // automatycznie transformuje typy
    }),
  );

  await app.listen(3000);
  console.log('🚀 Backend działa na http://localhost:3000');
}
bootstrap();
