import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePlaceReportDto } from './dto/create-place-report.dto';
import { GetAdminReportsDto } from './dto/get-admin-reports.dto';
import { GetPlaceReportsDto } from './dto/get-place-reports.dto';
import { ModerateReportDto } from './dto/moderate-report.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('places/:id/reports')
  @ApiOperation({
    summary: 'Create a report for a place (authenticated users)',
  })
  createReport(
    @Param('id') id: string,
    @CurrentUser() user: { _id: string },
    @Body() body: CreatePlaceReportDto,
  ) {
    return this.reportsService.createForPlace(id, user._id, body);
  }

  @Get('places/:id/reports')
  @ApiOperation({ summary: 'Get recent reports for a place' })
  getReportsForPlace(
    @Param('id') id: string,
    @Query() query: GetPlaceReportsDto,
  ) {
    return this.reportsService.getForPlace(id, query.limit ?? 20);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get('admin/reports')
  @ApiOperation({ summary: 'Admin list reports with moderation filters' })
  listAdminReports(@Query() query: GetAdminReportsDto) {
    return this.reportsService.listForAdmin(query);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch('admin/reports/:id/verify')
  verifyReport(
    @Param('id') id: string,
    @CurrentUser() user: { _id: string },
    @Body() body: ModerateReportDto,
  ) {
    return this.reportsService.verify(id, user._id, body.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch('admin/reports/:id/reject')
  rejectReport(
    @Param('id') id: string,
    @CurrentUser() user: { _id: string },
    @Body() body: ModerateReportDto,
  ) {
    return this.reportsService.reject(id, user._id, body.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch('admin/reports/:id/mark-spam')
  markReportAsSpam(
    @Param('id') id: string,
    @CurrentUser() user: { _id: string },
    @Body() body: ModerateReportDto,
  ) {
    return this.reportsService.markSpam(id, user._id, body.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch('admin/reports/:id/unmark-spam')
  unmarkReportAsSpam(
    @Param('id') id: string,
    @CurrentUser() user: { _id: string },
    @Body() body: ModerateReportDto,
  ) {
    return this.reportsService.unmarkSpam(id, user._id, body.reason);
  }
}
