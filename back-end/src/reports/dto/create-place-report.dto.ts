import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  REPORT_ISSUE_TYPES,
  type ReportIssueType,
} from '../schemas/place-report.schema';

export class CreatePlaceReportDto {
  @IsIn(REPORT_ISSUE_TYPES)
  issueType!: ReportIssueType;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8_000_000)
  imageBase64?: string;
}
