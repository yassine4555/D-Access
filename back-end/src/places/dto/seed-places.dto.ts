import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class SeedPlacesDto {
  @ApiProperty({ example: 36.7538, description: 'City center latitude' })
  @Transform(({ value }) => Number(value))
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 3.0588, description: 'City center longitude' })
  @Transform(({ value }) => Number(value))
  @IsLongitude()
  lon: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Seed radius in meters',
    minimum: 250,
    maximum: 10000,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 2500 : Number(value)))
  @IsInt()
  @Min(250)
  @Max(10000)
  radius?: number;
}
