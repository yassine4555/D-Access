import {
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IngestCityDto } from './dto/ingest-city.dto';
import { NearbyPlacesDto } from './dto/nearby-places.dto';
import { SeedPlacesDto } from './dto/seed-places.dto';
import { PlacesService } from './places.service';

@ApiTags('places')
@Controller()
export class PlacesController {
  private readonly logger = new Logger(PlacesController.name);

  constructor(private readonly placesService: PlacesService) {}

  @Get('places/nearby')
  @ApiOperation({
    summary: 'Get nearby places from cached MongoDB data',
  })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Nearby places with pagination' })
  findNearby(@Query() query: NearbyPlacesDto) {
    return this.placesService.findNearby(query);
  }

  @Get('places/:id')
  @ApiOperation({
    summary: 'Get place details by id',
  })
  @ApiParam({
    name: 'id',
    example: 'osm:node:123456789',
    description:
      'Place identifier (normalized sourceId like osm:node:123 or Mongo ObjectId)',
  })
  @ApiResponse({ status: 200, description: 'Place details payload' })
  @ApiResponse({ status: 404, description: 'Place not found' })
  getPlaceById(@Param('id') id: string) {
    return this.placesService.getPlaceById(id);
  }

  @Post('places/seed')
  @ApiOperation({ summary: 'Seed places from Overpass for a center+radius' })
  @ApiResponse({ status: 200, description: 'Seed/import summary' })
  seedFromOverpass(@Query() query: SeedPlacesDto) {
    return this.placesService.seedFromOverpass(query);
  }

  @Post('admin/ingest/city')
  @ApiOperation({
    summary: 'Manual city ingestion trigger (dev-only in this MVP)',
  })
  @ApiResponse({ status: 200, description: 'City ingestion summary' })
  ingestCity(@Query() query: IngestCityDto) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(
        'Manual ingestion endpoint is disabled in production.',
      );
    }

    if (query.city) {
      this.logger.log(`Ingestion requested for city: ${query.city}`);
    }

    return this.placesService.seedFromOverpass(query);
  }
}
