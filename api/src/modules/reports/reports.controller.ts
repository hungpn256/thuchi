import { Controller, Get, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { TrendFilterDto } from './dto/trend-filter.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SummaryReportResponseDto } from './dto/summary-report-response.dto';
import { CategoryReportResponseDto } from './dto/category-report-response.dto';
import { TrendReportResponseDto } from './dto/trend-report-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Profile } from '@/shared/decorators/profile.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Lấy báo cáo tổng quan thu chi' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo tổng quan thu chi',
    type: SummaryReportResponseDto,
  })
  async getSummaryReport(
    @Request() req,
    @Query(ValidationPipe) filter: ReportFilterDto,
    @Profile() profile,
  ): Promise<SummaryReportResponseDto> {
    return this.reportsService.getSummaryReport(profile.id, filter);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lấy báo cáo theo danh mục' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo theo danh mục',
    type: CategoryReportResponseDto,
  })
  async getCategoryReport(
    @Request() req,
    @Query(ValidationPipe) filter: ReportFilterDto,
    @Profile() profile,
  ): Promise<CategoryReportResponseDto> {
    return this.reportsService.getCategoryReport(profile.id, filter);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Lấy báo cáo xu hướng theo thời gian' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo xu hướng theo thời gian',
    type: TrendReportResponseDto,
  })
  async getTrendReport(
    @Request() req,
    @Query(ValidationPipe) filter: TrendFilterDto,
    @Profile() profile,
  ): Promise<TrendReportResponseDto> {
    return this.reportsService.getTrendReport(profile.id, filter);
  }
}
