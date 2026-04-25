import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import {
  MARKETPLACE_CATEGORIES,
  type MarketplaceCategory,
} from '../schemas/marketplace-item.schema';

export class CreateMarketplaceItemDto {
  @IsString()
  @MaxLength(140)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsIn(MARKETPLACE_CATEGORIES)
  category?: MarketplaceCategory;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsString()
  @IsUrl({ require_protocol: true })
  productUrl!: string;
}
