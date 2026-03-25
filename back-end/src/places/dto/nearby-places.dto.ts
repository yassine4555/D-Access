import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class NearbyPlacesDto {
  @ApiProperty({ example: 36.7538, description: 'Center latitude' })
  @Transform(({ value }) => Number(value))
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 3.0588, description: 'Center longitude' })
  @Transform(({ value }) => Number(value))
  @IsLongitude()
  lon: number;

  @ApiPropertyOptional({
    example: 3000,
    description: 'Search radius in meters',
    minimum: 100,
    maximum: 50000,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 3000 : Number(value)))
  @IsInt()
  @Min(100)
  @Max(50000)
  radius?: number;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 20 : Number(value)))
  @IsInt()
  @IsPositive()
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'amenity',
    description: 'Filter by normalized category',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    enum: ['yes', 'no', 'limited', 'unknown'],
    description: 'Filter by wheelchair accessibility',
  })
  @IsOptional()
  @IsString()
  wheelchair?: 'yes' | 'no' | 'limited' | 'unknown';
}
