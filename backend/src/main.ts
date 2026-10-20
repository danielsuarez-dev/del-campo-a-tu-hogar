import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: solo permite el origen del frontend en desarrollo (Vite)
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Validación global de DTOs (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Error al iniciar la aplicación:', err);
  process.exit(1);
});