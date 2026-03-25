import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SeedPlacesDto } from './seed-places.dto';

export class IngestCityDto extends SeedPlacesDto {
  @ApiPropertyOptional({
    example: 'Algiers',
    description: 'Optional city label for logs and ingestion reports',
  })
  @IsOptional()
  @IsString()
  city?: string;
}
