import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { REPORT_ISSUE_TYPES, type ReportIssueType } from '../schemas/place-report.schema';

export class CreatePlaceReportDto {
  @IsIn(REPORT_ISSUE_TYPES)
  issueType: ReportIssueType;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(4)
  @MaxLength(1000)
  description?: string;
}
