import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { PlacesService } from '../places.service';

function parseArg(name: string, fallback?: number): number | undefined {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
  if (!arg) {
    return fallback;
  }
  const value = Number(arg.split('=')[1]);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid numeric value for --${name}`);
  }
  return value;
}

async function run() {
  const lat = parseArg('lat');
  const lon = parseArg('lon');
  const radius = parseArg('radius', 2500);

  if (lat === undefined || lon === undefined) {
    throw new Error(
      'Usage: npm run seed:places -- --lat=<latitude> --lon=<longitude> [--radius=2500]',
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const placesService = app.get(PlacesService);
    const result = await placesService.seedFromOverpass({ lat, lon, radius });
    console.log('Seed complete:', result);
  } finally {
    await app.close();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Seed failed:', message);
  process.exit(1);
});
