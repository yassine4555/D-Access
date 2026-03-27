import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dns from 'dns';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Force DNS resolution to Google DNS to bypass local network issues with SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('D-Access API')
    .setDescription('D-Access backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const details = errors.flatMap((error) => {
          const constraints = error.constraints
            ? Object.values(error.constraints)
            : [];
          return constraints.map((message) => ({
            field: error.property,
            message,
          }));
        });

        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        });
      },
    }),
  );

  // Enable cookie parsing - REQUIRED for OAuth redirect URI handling
  app.use(cookieParser());

  // Enable CORS - REQUIRED for mobile app to connect
  app.enableCors({
    origin: true, // Reflect request origin (suitable for token-based auth)
    credentials: true, // Allow cookies in CORS requests
  });

  // Listen on 0.0.0.0 - REQUIRED for Android emulator to reach via 10.0.2.2
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  console.log(
    `Backend running on http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger docs on http://localhost:${process.env.PORT ?? 3000}/api-docs`,
  );
}
void bootstrap();
