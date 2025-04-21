'use client';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useTransactionList } from '@/hooks/use-transactions';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
import { Plus, Filter, FileEdit, Trash, X } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatCurrency } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useDeleteTransaction } from '@/hooks/use-transactions';
import { TransactionForm } from '@/components/transaction/transaction-form';
import { ROUTES } from '@/constants/app.constant';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { PaginationControl } from '@/components/transaction/PaginationControl';
import { SearchInput } from '@/components/transaction/SearchInput';
import { TransactionTypeSelect } from '@/components/transaction/TransactionTypeSelect';
import { MultiCategorySelect } from '@/components/transaction/MultiCategorySelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionType } from '@/types/transaction';

export default function TransactionsPage() {
  const router = useRouter();

  // Filters state
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedType, setSelectedType] = useState<TransactionType | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // UI state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch transaction data
  const { data, isLoading } = useTransactionList({
    startDate: date?.from,
    endDate: date?.to,
    limit,
    page,
    categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
    type: selectedType,
    search: searchTerm || undefined,
  });

  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

  // Reset page when filters change
  const resetPage = () => {
    setPage(1);
  };

  // Handle filters
  const handleCategoriesChange = (categories: number[]) => {
    setSelectedCategories(categories);
    resetPage();
  };

  const handleTypeChange = (type: TransactionType | undefined) => {
    setSelectedType(type);
    resetPage();
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    resetPage();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    resetPage();
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range);
    resetPage();
  };

  // Handle CRUD operations
  const handleDeleteTransaction = () => {
    if (selectedTransactionId) {
      deleteTransaction(selectedTransactionId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
        },
      });
    }
  };

  const handleEditClick = (id: string) => {
    setSelectedTransactionId(id);
    setIsTransactionDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedTransactionId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateClick = () => {
    router.push(ROUTES.TRANSACTIONS.NEW);
  };

  const handleTransactionDialogClose = () => {
    setIsTransactionDialogOpen(false);
    setSelectedTransactionId(null);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedType(undefined);
    setSearchTerm('');
    resetPage();
  };

  const hasActiveFilters = selectedCategories.length > 0 || !!selectedType || !!searchTerm;

  return (
    <div className="from-background/10 via-background/50 to-background/80 min-h-screen bg-gradient-to-b">
      <Header />
      <div className="container mx-auto space-y-8 px-4 py-10">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight">Danh sách giao dịch</h1>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Bộ lọc
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {selectedCategories.length + (selectedType ? 1 : 0) + (searchTerm ? 1 : 0)}
                </Badge>
              )}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'dd/MM/yyyy', { locale: vi })} -{' '}
                        {format(date.to, 'dd/MM/yyyy', { locale: vi })}
                      </>
                    ) : (
                      format(date.from, 'dd/MM/yyyy', { locale: vi })
                    )
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateChange}
                  numberOfMonths={2}
                  locale={vi}
                />
              </PopoverContent>
            </Popover>

            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm mới
            </Button>
          </div>
        </div>

        {/* Filters panel */}
        {isFilterOpen && (
          <Card className="p-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <SearchInput
                  onSearch={handleSearchChange}
                  initialSearch={searchTerm}
                  placeholder="Tìm theo mô tả..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Danh mục</label>
                <MultiCategorySelect
                  onCategoriesChange={handleCategoriesChange}
                  selectedCategories={selectedCategories}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Loại giao dịch</label>
                <TransactionTypeSelect
                  onTypeChange={handleTypeChange}
                  selectedType={selectedType}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters} size="sm" className="gap-2">
                  <X className="h-4 w-4" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </Card>
        )}

        <Card className="p-2">
          <CardHeader className="px-6 pt-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle>Giao dịch</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Số mục mỗi trang:</span>
                <Select value={limit.toString()} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: limit }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.items?.length ? (
              <>
                <div className="text-muted-foreground mb-4 text-sm">
                  Hiển thị {(page - 1) * limit + 1} đến {Math.min(page * limit, data.total)} trong
                  tổng số {data.total} giao dịch
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{transaction.category?.name || 'Không có danh mục'}</TableCell>
                        <TableCell>
                          {format(new Date(transaction.date), 'dd/MM/yyyy', {
                            locale: vi,
                          })}
                        </TableCell>
                        <TableCell
                          className={cn('text-right font-medium', {
                            'text-emerald-600 dark:text-emerald-400': transaction.type === 'INCOME',
                            'text-rose-600 dark:text-rose-400': transaction.type === 'EXPENSE',
                          })}
                        >
                          {transaction.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleEditClick(transaction.id.toString())}
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(transaction.id.toString())}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {data.totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <PaginationControl
                      currentPage={page}
                      totalPages={data.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  Không có giao dịch nào trong khoảng thời gian này
                  {hasActiveFilters && ' với các bộ lọc đã chọn'}
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearAllFilters}>
                      Xóa bộ lọc
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleCreateClick}>
                    Tạo giao dịch mới
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteTransaction} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Dialog (for Edit only) */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
          </DialogHeader>
          <TransactionForm
            transactionId={selectedTransactionId || undefined}
            onSuccess={handleTransactionDialogClose}
            mode="update"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
