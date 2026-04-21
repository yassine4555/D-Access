import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PlaceDocument = HydratedDocument<Place>;

@Schema({ _id: false })
export class Accessibility {
  @Prop({
    type: String,
    enum: ['yes', 'no', 'limited', 'unknown'],
    default: 'unknown',
  })
  wheelchair!: 'yes' | 'no' | 'limited' | 'unknown';

  @Prop({
    type: String,
    enum: ['yes', 'no', 'unknown'],
    default: 'unknown',
  })
  toiletsWheelchair!: 'yes' | 'no' | 'unknown';
}

const AccessibilitySchema = SchemaFactory.createForClass(Accessibility);

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point', required: true })
  type!: 'Point';

  @Prop({ type: [Number], required: true })
  coordinates!: [number, number];
}

const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

@Schema({ timestamps: false, collection: 'places' })
export class Place {
  @Prop({ type: String, default: 'osm', required: true })
  source!: 'osm';

  @Prop({ type: String, enum: ['node', 'way', 'relation'], required: true })
  osmType!: 'node' | 'way' | 'relation';

  @Prop({ type: Number, required: true })
  osmId!: number;

  @Prop({ type: String, required: true, unique: true })
  sourceId!: string;

  @Prop({ type: String, default: '' })
  name!: string;

  @Prop({ type: String, default: 'other', index: true })
  category!: string;

  @Prop({ type: GeoPointSchema, required: true })
  location!: GeoPoint;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  tags!: Record<string, string>;

  @Prop({ type: AccessibilitySchema, default: () => ({}) })
  accessibility!: Accessibility;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt!: Date;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);

PlaceSchema.index({ location: '2dsphere' });
PlaceSchema.index({ source: 1, osmType: 1, osmId: 1 }, { unique: true });
PlaceSchema.index({ 'accessibility.wheelchair': 1 });
PlaceSchema.index({ 'accessibility.toiletsWheelchair': 1 });
PlaceSchema.index({ category: 1, 'accessibility.wheelchair': 1 });
