import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Place, PlaceDocument } from '../places/schemas/place.schema';
import { CreatePlaceReportDto } from './dto/create-place-report.dto';
import { GetAdminReportsDto } from './dto/get-admin-reports.dto';
import {
  PlaceReport,
  PlaceReportDocument,
  ReportStatus,
} from './schemas/place-report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(PlaceReport.name)
    private readonly reportModel: Model<PlaceReportDocument>,
    @InjectModel(Place.name)
    private readonly placeModel: Model<PlaceDocument>,
  ) {}

  async createForPlace(
    placeIdentifier: string,
    userId: string,
    dto: CreatePlaceReportDto,
  ) {
    const place = await this.findPlaceOrThrow(placeIdentifier);
    const reporterId = this.toObjectIdOrThrow(
      userId,
      'Invalid user id in token.',
    );

    await this.enforceRateLimit(reporterId);

    const duplicate = await this.reportModel
      .findOne({
        userId: reporterId,
        placeId: place._id,
        issueType: dto.issueType,
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
      })
      .lean()
      .exec();

    if (duplicate) {
      throw new BadRequestException({
        code: 'REPORT_DUPLICATE_RECENT',
        message:
          'A similar report was already submitted recently for this place.',
      });
    }

    const description = (dto.description ?? '').trim();
    const { imageData, imageContentType } = this.parseImageDataUrl(
      dto.imageBase64,
    );
    const spamScore = this.computeSpamScore(description);

    const report = await this.reportModel.create({
      userId: reporterId,
      placeId: place._id,
      issueType: dto.issueType,
      description,
      imageData,
      imageContentType,
      spamScore,
      confidenceScore: Math.max(0, 100 - spamScore),
      status: spamScore >= 80 ? 'spam' : 'pending',
    });

    return {
      id: report._id.toString(),
      placeId: place.sourceId,
      issueType: report.issueType,
      description: report.description,
      imageUrl: this.toDataUrl(report.imageData, report.imageContentType),
      status: report.status,
      spamScore: report.spamScore,
      createdAt: report.createdAt,
    };
  }

  async getForPlace(placeIdentifier: string, limit = 20) {
    const place = await this.findPlaceOrThrow(placeIdentifier);
    const reports = await this.reportModel
      .find({
        placeId: place._id,
        status: { $in: ['pending', 'verified'] },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName')
      .lean()
      .exec();

    return {
      data: reports.map((report) => ({
        id: report._id.toString(),
        issueType: report.issueType,
        description: report.description,
        imageUrl: this.toDataUrl(report.imageData, report.imageContentType),
        status: report.status,
        createdAt: report.createdAt,
        user: this.mapReporter(report.userId),
      })),
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid report id.');
    }

    const report = await this.reportModel
      .findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('placeId', 'sourceId name')
      .lean()
      .exec();

    if (!report) {
      throw new NotFoundException('Report not found.');
    }

    return {
      id: report._id.toString(),
      issueType: report.issueType,
      description: report.description,
      imageUrl: this.toDataUrl(report.imageData, report.imageContentType),
      status: report.status,
      spamScore: report.spamScore,
      confidenceScore: report.confidenceScore,
      createdAt: report.createdAt,
      moderatedAt: report.moderatedAt,
      moderationReason: report.moderationReason,
      user: this.mapReporter(report.userId),
      place: this.mapPlace(report.placeId),
    };
  }

  async listForAdmin(query: GetAdminReportsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.issueType) {
      filter.issueType = query.issueType;
    }

    if (query.userId && Types.ObjectId.isValid(query.userId)) {
      filter.userId = new Types.ObjectId(query.userId);
    }

    if (query.placeId) {
      const place = await this.findPlaceOrThrow(query.placeId);
      filter.placeId = place._id;
    }

    const [items, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email')
        .populate('placeId', 'sourceId name')
        .lean()
        .exec(),
      this.reportModel.countDocuments(filter).exec(),
    ]);
// rest
    return {
      data: items.map((report) => ({
        id: report._id.toString(),
        issueType: report.issueType,
        description: report.description,
        imageUrl: this.toDataUrl(report.imageData, report.imageContentType),
        status: report.status,
        spamScore: report.spamScore,
        confidenceScore: report.confidenceScore,
        createdAt: report.createdAt,
        moderatedAt: report.moderatedAt,
        moderationReason: report.moderationReason,
        user: this.mapReporter(report.userId),
        place: this.mapPlace(report.placeId),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  verify(reportId: string, moderatorId: string, reason?: string) {
    return this.updateStatus(reportId, 'verified', moderatorId, reason);
  }

  reject(reportId: string, moderatorId: string, reason?: string) {
    return this.updateStatus(reportId, 'rejected', moderatorId, reason);
  }

  markSpam(reportId: string, moderatorId: string, reason?: string) {
    return this.updateStatus(reportId, 'spam', moderatorId, reason);
  }

  unmarkSpam(reportId: string, moderatorId: string, reason?: string) {
    return this.updateStatus(reportId, 'pending', moderatorId, reason);
  }

  private async updateStatus(
    reportId: string,
    status: ReportStatus,
    moderatorId: string,
    reason?: string,
  ) {
    if (!Types.ObjectId.isValid(reportId)) {
      throw new BadRequestException('Invalid report id.');
    }

    const moderatorObjectId = this.toObjectIdOrThrow(
      moderatorId,
      'Invalid moderator id in token.',
    );

    const updated = await this.reportModel
      .findByIdAndUpdate(
        reportId,
        {
          $set: {
            status,
            moderatedBy: moderatorObjectId,
            moderatedAt: new Date(),
            moderationReason: reason?.trim() || undefined,
          },
        },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Report not found.');
    }

    return {
      id: updated._id.toString(),
      status: updated.status,
      moderatedAt: updated.moderatedAt,
      moderationReason: updated.moderationReason,
    };
  }

  private async findPlaceOrThrow(placeIdentifier: string) {
    const query = Types.ObjectId.isValid(placeIdentifier)
      ? {
          $or: [
            { _id: new Types.ObjectId(placeIdentifier) },
            { sourceId: placeIdentifier },
          ],
        }
      : { sourceId: placeIdentifier };

    const place = await this.placeModel.findOne(query).exec();

    if (!place) {
      throw new NotFoundException(`Place not found for id: ${placeIdentifier}`);
    }

    return place;
  }

  private toObjectIdOrThrow(
    value: string,
    errorMessage: string,
  ): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(errorMessage);
    }

    return new Types.ObjectId(value);
  }

  private async enforceRateLimit(userId: Types.ObjectId) {
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const recentCount = await this.reportModel
      .countDocuments({ userId, createdAt: { $gte: since } })
      .exec();

    if (recentCount >= 5) {
      throw new HttpException(
        {
          code: 'REPORT_RATE_LIMIT',
          message:
            'Too many reports submitted in a short period. Try again soon.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private computeSpamScore(description: string): number {
    let score = 0;

    if (!description) {
      return 0;
    }

    if (description.length < 10) {
      score += 25;
    }

    const linkMatches = description.match(/https?:\/\//gi);
    if (linkMatches && linkMatches.length > 0) {
      score += 30;
    }

    if (/([a-zA-Z])\1{6,}/.test(description)) {
      score += 30;
    }

    const uppercaseRatio =
      description.replace(/[^A-Z]/g, '').length /
      Math.max(description.replace(/[^a-zA-Z]/g, '').length, 1);

    if (uppercaseRatio > 0.8 && description.length > 20) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private mapReporter(user: unknown) {
    if (!user || typeof user !== 'object') {
      return null;
    }

    const record = user as Record<string, unknown>;
    return {
      id: this.toSafeId(record._id),
      firstName: typeof record.firstName === 'string' ? record.firstName : '',
      lastName: typeof record.lastName === 'string' ? record.lastName : '',
      email: typeof record.email === 'string' ? record.email : undefined,
    };
  }

  private mapPlace(place: unknown) {
    if (!place || typeof place !== 'object') {
      return null;
    }

    const record = place as Record<string, unknown>;
    return {
      id: this.toSafeId(record._id),
      sourceId: typeof record.sourceId === 'string' ? record.sourceId : '',
      name: typeof record.name === 'string' ? record.name : '',
    };
  }

  private parseImageDataUrl(imageBase64?: string): {
    imageData?: Buffer;
    imageContentType?: string;
  } {
    if (!imageBase64) {
      return {};
    }

    const value = imageBase64.trim();
    const match =
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(value);

    if (!match) {
      throw new BadRequestException(
        'Invalid image format. Expected a base64 image data URL.',
      );
    }

    const [, imageContentType, encodedData] = match;
    const imageData = Buffer.from(encodedData, 'base64');

    if (imageData.length === 0) {
      throw new BadRequestException('Image payload is empty.');
    }

    if (imageData.length > 5 * 1024 * 1024) {
      throw new BadRequestException('Image must be 5MB or smaller.');
    }

    return { imageData, imageContentType };
  }

  private toSafeId(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (value instanceof Types.ObjectId) {
      return value.toHexString();
    }

    return '';
  }

  private toDataUrl(
    imageData?: Buffer,
    imageContentType?: string,
  ): string | undefined {
    if (!imageData || !imageContentType) {
      return undefined;
    }

    return `data:${imageContentType};base64,${imageData.toString('base64')}`;
  }
}
