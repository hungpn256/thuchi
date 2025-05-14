import { DateRangeQueryDto } from '@/shared/dto/date-range-query.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ValidationException,
} from '@/shared/exceptions/app.exception';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionService } from './transaction.service';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { Profile } from '@/shared/decorators/profile.decorator';
import { Account } from '@/shared/decorators/account.decorator';
import { AdminOrWriteGuard } from '../auth/guards/admin-write.guard';
import { CreateTransactionsBatchDto } from './dto/create-transaction.dto';
import { CreateTransactionFromDescriptionDto } from './dto/create-transaction-from-description.dto';
import { account } from '@prisma/client';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseGuards(AdminOrWriteGuard)
  @ApiOperation({
    summary: 'Tạo giao dịch mới',
    description: 'API tạo giao dịch thu/chi mới',
  })
  @ApiBody({
    type: CreateTransactionDto,
    examples: {
      income: {
        value: {
          type: 'INCOME',
          amount: 1000000,
          description: 'Lương tháng 1',
          date: '2024-01-01',
        },
        summary: 'Income Transaction Example',
      },
      expense: {
        value: {
          type: 'EXPENSE',
          amount: 500000,
          description: 'Tiền điện tháng 1',
          date: '2024-01-01',
        },
        summary: 'Expense Transaction Example',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo giao dịch thành công',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
  async createTransaction(
    @Profile() profile,
    @Account() account: account,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    try {
      // Validation is handled by class-validator through CreateTransactionDto
      return await this.transactionService.create({
        ...createTransactionDto,
        profileId: profile.id,
        createdById: account.id,
      });
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new BadRequestException('Failed to create transaction', { error: error.message });
    }
  }

  @Post('batch')
  @UseGuards(AdminOrWriteGuard)
  @ApiOperation({
    summary: 'Tạo nhiều giao dịch cùng lúc',
    description: 'API tạo nhiều giao dịch thu/chi mới',
  })
  @ApiBody({ type: CreateTransactionsBatchDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tạo nhiều giao dịch thành công' })
  async createTransactionsBatch(
    @Profile() profile,
    @Account() account: account,
    @Body() dto: CreateTransactionsBatchDto,
  ) {
    try {
      return await this.transactionService.createBatch({
        transactions: dto.transactions,
        profileId: profile.id,
        createdById: account.id,
      });
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new BadRequestException('Failed to create transactions batch', {
        error: error.message,
      });
    }
  }

  @Get('expenses-by-category')
  @ApiOperation({
    summary: 'Lấy danh sách chi tiêu theo danh mục',
    description: 'API lấy danh sách chi tiêu theo danh mục có phân trang và lọc theo ngày',
  })
  async getExpensesByCategory(
    @Profile() profile,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const transactions = await this.transactionService.getExpensesByCategory(
      profile.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return transactions.map((item) => ({
      categoryId: item.categoryid,
      categoryName: item.categoryname,
      total: Number(item.total),
    }));
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách giao dịch',
    description: 'API lấy danh sách giao dịch có phân trang và lọc theo ngày',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách giao dịch thành công',
  })
  async getTransactions(@Profile() profile, @Query() query: GetTransactionsDto) {
    try {
      return await this.transactionService.findAll(profile.id, {
        ...query,
      });
    } catch (error) {
      throw new BadRequestException('Failed to get transactions', { error: error.message });
    }
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Lấy tổng quan giao dịch',
    description: 'API lấy tổng thu, chi và số dư trong khoảng thời gian',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy tổng quan giao dịch thành công',
    schema: {
      example: {
        totalIncome: 5000000,
        totalExpense: 3000000,
        balance: 2000000,
      },
    },
  })
  async getTransactionSummary(@Profile() profile, @Query() dateRange: DateRangeQueryDto) {
    try {
      return await this.transactionService.getSummary(profile.id, dateRange);
    } catch (error) {
      throw new BadRequestException('Failed to get transaction summary', { error: error.message });
    }
  }

  @Get('summary-by-month')
  @ApiOperation({
    summary: 'Tổng thu/chi 10 tháng gần nhất',
    description: 'Trả về tổng thu và tổng chi cho 10 tháng gần nhất của user hiện tại',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  async getSummaryByMonth(@Profile() profile) {
    return this.transactionService.getSummaryByMonth(profile.id, 10);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết giao dịch',
    description: 'API lấy thông tin chi tiết của một giao dịch theo ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy chi tiết giao dịch thành công',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy giao dịch' })
  async getTransactionById(@Profile() profile, @Param('id') id: number) {
    try {
      const transaction = await this.transactionService.findOne(id);
      if (!transaction) {
        throw new NotFoundException('Không tìm thấy giao dịch');
      }
      if (transaction.profileId !== profile.id) {
        throw new UnauthorizedException('Bạn không có quyền truy cập giao dịch này');
      }
      return transaction;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy thông tin giao dịch', { error: error.message });
    }
  }

  @Put(':id')
  @UseGuards(AdminOrWriteGuard)
  @ApiOperation({
    summary: 'Cập nhật giao dịch',
    description: 'API cập nhật thông tin của một giao dịch theo ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật giao dịch thành công',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy giao dịch' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
  async updateTransaction(
    @Profile() profile,
    @Param('id') id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    try {
      const transaction = await this.transactionService.findOne(id);
      if (!transaction) {
        throw new NotFoundException('Không tìm thấy giao dịch');
      }
      if (transaction.profileId !== profile.id) {
        throw new UnauthorizedException('Bạn không có quyền cập nhật giao dịch này');
      }
      if (updateTransactionDto.amount && updateTransactionDto.amount <= 0) {
        throw new ValidationException({ amount: 'Số tiền phải lớn hơn 0' });
      }
      return await this.transactionService.update(id, updateTransactionDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof ValidationException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật giao dịch', { error: error.message });
    }
  }

  @Delete(':id')
  @UseGuards(AdminOrWriteGuard)
  @ApiOperation({
    summary: 'Xóa giao dịch',
    description: 'API xóa một giao dịch theo ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa giao dịch thành công',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy giao dịch' })
  async deleteTransaction(@Profile() profile, @Param('id') id: number) {
    try {
      const transaction = await this.transactionService.findOne(id);
      if (!transaction) {
        throw new NotFoundException('Không tìm thấy giao dịch');
      }
      if (transaction.profileId !== profile.id) {
        throw new UnauthorizedException('Bạn không có quyền xóa giao dịch này');
      }
      await this.transactionService.remove(id);
      return { message: 'Xóa giao dịch thành công' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Không thể xóa giao dịch', { error: error.message });
    }
  }

  @Post('preview')
  @ApiOperation({
    summary: 'Tạo giao dịch từ mô tả',
    description: 'API tạo giao dịch từ mô tả và số tiền',
  })
  @ApiBody({ type: CreateTransactionFromDescriptionDto })
  async createTransactionFromDescription(
    @Account() account: account,
    @Body() body: CreateTransactionFromDescriptionDto,
  ) {
    try {
      return await this.transactionService.createFromDescription(body.text, account.id);
    } catch (error) {
      throw new BadRequestException('Failed to create transaction from description', {
        error: error.message,
      });
    }
  }
}
