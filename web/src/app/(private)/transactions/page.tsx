"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useTransactionList } from "@/hooks/use-transactions";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { Plus, Filter, FileEdit, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useDeleteTransaction } from "@/hooks/use-transactions";
import { TransactionForm } from "@/components/transaction/transaction-form";

export default function TransactionsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

  const { data, isLoading } = useTransactionList({
    startDate: date?.from,
    endDate: date?.to,
    limit: 100,
  });

  const { mutate: deleteTransaction, isPending: isDeleting } =
    useDeleteTransaction();

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
    setSelectedTransactionId(null);
    setIsTransactionDialogOpen(true);
  };

  const handleTransactionDialogClose = () => {
    setIsTransactionDialogOpen(false);
    setSelectedTransactionId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/10 via-background/50 to-background/80">
      <Header />
      <div className="container mx-auto py-10 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Danh sách giao dịch
          </h1>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                        {format(date.to, "dd/MM/yyyy", { locale: vi })}
                      </>
                    ) : (
                      format(date.from, "dd/MM/yyyy", { locale: vi })
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
                  onSelect={setDate}
                  numberOfMonths={2}
                  locale={vi}
                />
              </PopoverContent>
            </Popover>
            <Button className="gap-2" onClick={handleCreateClick}>
              <Plus className="w-4 h-4" />
              Thêm mới
            </Button>
          </div>
        </div>

        <Card className="p-2">
          <CardHeader className="px-6 pt-6">
            <CardTitle>Giao dịch</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
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
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        {transaction.category?.name || "Không có danh mục"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(transaction.date), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </TableCell>
                      <TableCell
                        className={cn("text-right font-medium", {
                          "text-emerald-600 dark:text-emerald-400":
                            transaction.type === "INCOME",
                          "text-rose-600 dark:text-rose-400":
                            transaction.type === "EXPENSE",
                        })}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
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
                              onClick={() =>
                                handleEditClick(transaction.id.toString())
                              }
                            >
                              <FileEdit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteClick(transaction.id.toString())
                              }
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
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Không có giao dịch nào trong khoảng thời gian này
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleCreateClick}
                >
                  Tạo giao dịch mới
                </Button>
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
              Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không
              thể hoàn tác.
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
            <Button
              variant="destructive"
              onClick={handleDeleteTransaction}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Dialog (for both Create and Edit) */}
      <Dialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTransactionId
                ? "Chỉnh sửa giao dịch"
                : "Tạo giao dịch mới"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            transactionId={selectedTransactionId || undefined}
            onSuccess={handleTransactionDialogClose}
            mode={selectedTransactionId ? "update" : "create"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
