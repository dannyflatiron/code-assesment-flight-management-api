import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false },
    }),
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Flight Management API')
    .setDescription('Flights & Bookings microservice')
    .setVersion('1.0.0')
    .addTag('Flights')
    .addTag('Bookings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // http://localhost:3000/api/docs

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Server running at http://localhost:3000');
}
bootstrap();
