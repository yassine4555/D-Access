import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const MARKETPLACE_CATEGORIES = ['mobility', 'daily_aids', 'other'] as const;
export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

export type MarketplaceItemDocument = HydratedDocument<MarketplaceItem>;

@Schema({ timestamps: true, collection: 'marketplace_items' })
export class MarketplaceItem {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: Number, required: true, min: 0 })
  price!: number;

  @Prop({ type: String, default: '' })
  description!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: String, enum: MARKETPLACE_CATEGORIES, default: 'other' })
  category!: MarketplaceCategory;

  @Prop({ type: Boolean, default: true })
  inStock!: boolean;

  @Prop({ type: String, required: true, trim: true })
  productUrl!: string;
}

export const MarketplaceItemSchema = SchemaFactory.createForClass(MarketplaceItem);

MarketplaceItemSchema.index({ category: 1, inStock: 1 });
MarketplaceItemSchema.index({ name: 'text', description: 'text' });
