import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MarketplaceItem,
  MarketplaceItemSchema,
} from './schemas/marketplace-item.schema.js';
import { MarketplaceController } from './marketplace.controller.js';
import { MarketplaceService } from './marketplace.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketplaceItem.name, schema: MarketplaceItemSchema },
    ]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
