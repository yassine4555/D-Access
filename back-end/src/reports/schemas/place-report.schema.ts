import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const REPORT_ISSUE_TYPES = [
  'elevator_out_of_order',
  'ramp_blocked',
  'parking_issue',
  'place_closed',
  'incorrect_info',
  'other',
] as const;

export const REPORT_STATUSES = [
  'pending',
  'verified',
  'rejected',
  'spam',
] as const;

export type ReportIssueType = (typeof REPORT_ISSUE_TYPES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type PlaceReportDocument = HydratedDocument<PlaceReport>;

@Schema({ timestamps: true, collection: 'place_reports' })
export class PlaceReport {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Place', required: true, index: true })
  placeId!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: REPORT_ISSUE_TYPES, index: true })
  issueType!: ReportIssueType;

  @Prop({ type: String, trim: true, maxlength: 1000, default: '' })
  description!: string;

  @Prop({ type: Buffer })
  imageData?: Buffer;

  @Prop({ type: String, trim: true, maxlength: 100 })
  imageContentType?: string;

  @Prop({
    type: String,
    enum: REPORT_STATUSES,
    default: 'pending',
    index: true,
  })
  status!: ReportStatus;

  @Prop({ min: 0, max: 100, default: 0, index: true })
  spamScore!: number;

  @Prop({ min: 0, max: 100, default: 0 })
  confidenceScore!: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  moderatedBy?: Types.ObjectId;

  @Prop({ type: Date })
  moderatedAt?: Date;

  @Prop({ type: String, trim: true, maxlength: 500 })
  moderationReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PlaceReportSchema = SchemaFactory.createForClass(PlaceReport);

PlaceReportSchema.index({ placeId: 1, createdAt: -1 });
PlaceReportSchema.index({ userId: 1, createdAt: -1 });
PlaceReportSchema.index({ status: 1, createdAt: -1 });
