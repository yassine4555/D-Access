import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dns from 'dns';
import cookieParser from 'cookie-parser';

// Force DNS resolution to Google DNS to bypass local network issues with SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing - REQUIRED for OAuth redirect URI handling
  app.use(cookieParser());

  // Enable CORS - REQUIRED for mobile app to connect
  app.enableCors({
    origin: true, // Reflect request origin (suitable for token-based auth)
    credentials: true, // Allow cookies in CORS requests
  });

  // Listen on 0.0.0.0 - REQUIRED for Android emulator to reach via 10.0.2.2
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  console.log(`Backend running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
