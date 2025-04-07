import { DateRangeQueryDto } from '@/shared/dto/date-range-query.dto';
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';
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

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
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
  async createTransaction(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    try {
      if (!createTransactionDto.amount || createTransactionDto.amount <= 0) {
        throw new ValidationException({ amount: 'Amount must be greater than 0' });
      }
      return await this.transactionService.create({
        ...createTransactionDto,
        userId: req.user.id,
      });
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new BadRequestException('Failed to create transaction', { error: error.message });
    }
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
  async getTransactions(
    @Request() req,
    @Query() paginationQuery: PaginationQueryDto,
    @Query() dateRange: DateRangeQueryDto,
  ) {
    try {
      return await this.transactionService.findAll(req.user.id, {
        ...paginationQuery,
        ...dateRange,
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
  async getTransactionSummary(@Request() req, @Query() dateRange: DateRangeQueryDto) {
    try {
      return await this.transactionService.getSummary(req.user.id, dateRange);
    } catch (error) {
      throw new BadRequestException('Failed to get transaction summary', { error: error.message });
    }
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
  async getTransactionById(@Request() req, @Param('id') id: string) {
    try {
      const transaction = await this.transactionService.findOne(id);
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      if (transaction.userId !== req.user.id) {
        throw new UnauthorizedException('You do not have permission to access this transaction');
      }
      return transaction;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to get transaction', { error: error.message });
    }
  }

  @Put(':id')
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
    @Request() req,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    try {
      const transaction = await this.transactionService.findOne(id);
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      if (transaction.userId !== req.user.id) {
        throw new UnauthorizedException('You do not have permission to update this transaction');
      }
      if (updateTransactionDto.amount && updateTransactionDto.amount <= 0) {
        throw new ValidationException({ amount: 'Amount must be greater than 0' });
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
      throw new BadRequestException('Failed to update transaction', { error: error.message });
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa giao dịch',
    description: 'API xóa một giao dịch theo ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa giao dịch thành công',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy giao dịch' })
  async deleteTransaction(@Request() req, @Param('id') id: string) {
    try {
      const transaction = await this.transactionService.findOne(id);
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      if (transaction.userId !== req.user.id) {
        throw new UnauthorizedException('You do not have permission to delete this transaction');
      }
      await this.transactionService.remove(id);
      return { message: 'Transaction deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete transaction', { error: error.message });
    }
  }
}
