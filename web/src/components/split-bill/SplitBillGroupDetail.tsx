'use client';
import { useSplitBillGroups } from '@/hooks/use-split-bill-groups';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, X, Download } from 'lucide-react';
import { useState } from 'react';
import { SplitBillExpenseForm } from './SplitBillExpenseForm';
import { SplitBillExpense } from '@/hooks/use-split-bill-groups';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import ExcelJS from 'exceljs';
import { toast } from '@/components/ui/use-toast';

export function SplitBillGroupDetail() {
  const { groups, updateGroup, calculateSummary, calculateSettlements } = useSplitBillGroups();
  const params = useParams();
  const groupId = params?.groupId as string;
  const group = groups.find((g) => g.id === groupId);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  if (!group) {
    return <div className="py-8 text-center">Không tìm thấy nhóm</div>;
  }

  const summary = calculateSummary(group);
  const settlements = calculateSettlements(group);

  // Add expense and update group
  const handleAddExpense = (expense: SplitBillExpense) => {
    const updatedGroup = {
      ...group,
      expenses: [...group.expenses, expense],
      updatedAt: new Date().toISOString(),
    };
    updateGroup(updatedGroup);
    setShowExpenseModal(false);
  };

  const handleExportExcel = async (): Promise<void> => {
    const workbook = new ExcelJS.Workbook();
    // Sheet 1: Expenses
    const expensesSheet = workbook.addWorksheet('Khoản chi');
    expensesSheet.addRow(['Người chi', 'Số tiền', 'Mô tả', 'Ngày']);
    group.expenses.forEach((e) => {
      expensesSheet.addRow([
        group.members.find((m) => m.id === e.payerId)?.name || '',
        e.amount,
        e.description || '',
        format(new Date(e.createdAt), 'dd/MM/yyyy', { locale: vi }),
      ]);
    });
    // Set column widths
    expensesSheet.columns = [
      { width: 20 }, // Người chi
      { width: 16 }, // Số tiền
      { width: 30 }, // Mô tả
      { width: 14 }, // Ngày
    ];
    expensesSheet.getColumn(2).numFmt = '#,##0 [$₫-vi-VN]';

    // Sheet 2: Số dư
    const summarySheet = workbook.addWorksheet('Tổng kết & số dư');
    summarySheet.addRow(['Thành viên', 'Đã trả', 'Nên trả', 'Chênh lệch']);
    summary.balances.forEach((b) => {
      summarySheet.addRow([b.member.name, b.paid, b.shouldPay, b.balance]);
    });
    // Set column widths
    summarySheet.columns = [
      { width: 20 }, // Thành viên
      { width: 16 }, // Đã trả
      { width: 16 }, // Nên trả
      { width: 16 }, // Chênh lệch
    ];
    summarySheet.getColumn(2).numFmt = '#,##0 [$₫-vi-VN]';
    summarySheet.getColumn(3).numFmt = '#,##0 [$₫-vi-VN]';
    summarySheet.getColumn(4).numFmt = '#,##0 [$₫-vi-VN]';

    // Sheet 3: Gợi ý chuyển tiền
    const settlementsSheet = workbook.addWorksheet('Gợi ý chuyển tiền');
    settlementsSheet.addRow(['Từ', 'Đến', 'Số tiền']);
    settlements.forEach((s) => {
      settlementsSheet.addRow([s.from.name, s.to.name, s.amount]);
    });
    // Set column widths
    settlementsSheet.columns = [
      { width: 20 }, // Từ
      { width: 20 }, // Đến
      { width: 16 }, // Số tiền
    ];
    settlementsSheet.getColumn(3).numFmt = '#,##0 [$₫-vi-VN]';

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${group.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({ title: 'Xuất Excel thành công', description: 'File đã được tải về.' });
  };

  return (
    <div className="from-background/10 via-background/50 to-background/80 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto space-y-6 px-2 py-2 md:space-y-6 md:py-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{group.name}</h1>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setShowExpenseModal(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Thêm khoản chi</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              title="Xuất Excel"
              className="gap-2"
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </Button>
          </div>
        </div>
        <Card className="overflow-hidden p-0 md:p-2">
          <CardHeader className="px-4 py-4 md:px-6 md:pt-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="text-xl">Các khoản chi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-6 md:px-6">
            {/* Desktop view - Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người chi</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-center">Ngày</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">
                        {group.members.find((m) => m.id === e.payerId)?.name}
                      </TableCell>
                      <TableCell className="text-right font-medium text-rose-600 dark:text-rose-400">
                        {formatCurrency(e.amount)}
                      </TableCell>
                      <TableCell>{e.description || '-'}</TableCell>
                      <TableCell className="text-center">
                        {format(new Date(e.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {group.expenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground py-4 text-center">
                        <span className="flex flex-col items-center gap-2">
                          <Plus className="mx-auto h-8 w-8 opacity-30" />
                          Chưa có khoản chi nào
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Mobile view - Card list */}
            <div className="grid grid-cols-1 gap-2 md:hidden">
              {group.expenses.map((e) => (
                <Card
                  key={e.id}
                  className="bg-card text-card-foreground rounded-lg border p-2 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-semibold">
                        {group.members.find((m) => m.id === e.payerId)?.name}
                      </h3>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <span>{e.description || '-'}</span>
                        <span>•</span>
                        <span>{format(new Date(e.createdAt), 'dd/MM/yyyy', { locale: vi })}</span>
                      </div>
                    </div>
                    <div className="text-right text-base font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(e.amount)}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t pt-1">
                    <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
                  </div>
                </Card>
              ))}
              {group.expenses.length === 0 && (
                <Card className="flex flex-col items-center justify-center gap-2 p-2 py-4">
                  <Plus className="mx-auto h-8 w-8 opacity-30" />
                  <span className="text-muted-foreground text-sm">Chưa có khoản chi nào</span>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Summary section styled like transaction summary */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-4 md:px-6 md:pt-6">
            <CardTitle className="text-xl">Tổng kết & chia tiền</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-6 px-4 pb-6 md:px-6">
            {/* Tổng chi và mỗi người nên trả */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-base font-medium">
                Tổng chi:{' '}
                <span className="text-primary font-bold">{formatCurrency(summary.total)}</span>
              </div>
              <div className="text-base font-medium">
                Mỗi người nên trả:{' '}
                <span className="text-primary font-bold">{formatCurrency(summary.perPerson)}</span>
              </div>
            </div>
            {/* Bảng số dư từng thành viên */}
            <div>
              <div className="text-foreground mb-2 text-sm font-semibold">
                Số dư từng thành viên
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thành viên</TableHead>
                      <TableHead className="text-right">Đã trả</TableHead>
                      <TableHead className="text-right">Nên trả</TableHead>
                      <TableHead className="text-right">Chênh lệch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.balances.map((b) => (
                      <TableRow key={b.member.id}>
                        <TableCell>{b.member.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(b.paid)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(b.shouldPay)}</TableCell>
                        <TableCell
                          className={
                            b.balance >= 0
                              ? 'text-right text-emerald-600'
                              : 'text-right text-rose-600'
                          }
                        >
                          {b.balance >= 0 ? '+' : '-'}
                          {formatCurrency(Math.abs(b.balance))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile: Card list */}
              <div className="grid grid-cols-1 gap-2 md:hidden">
                {summary.balances.map((b) => (
                  <Card
                    key={b.member.id}
                    className="flex flex-row items-center justify-between p-3"
                  >
                    <div>
                      <div className="font-semibold">{b.member.name}</div>
                      <div className="text-muted-foreground text-xs">
                        Đã trả: {formatCurrency(b.paid)}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Nên trả: {formatCurrency(b.shouldPay)}
                      </div>
                    </div>
                    <div
                      className={
                        b.balance >= 0
                          ? 'text-right font-bold text-emerald-600'
                          : 'text-right font-bold text-rose-600'
                      }
                    >
                      {b.balance >= 0 ? '+' : '-'}
                      {formatCurrency(Math.abs(b.balance))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            {/* Gợi ý chuyển tiền */}
            <div>
              <div className="text-foreground mb-2 text-sm font-semibold">Gợi ý chuyển tiền</div>
              {settlements.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  Không cần chuyển tiền, mọi người đã cân bằng.
                </div>
              ) : (
                <div className="space-y-2">
                  {settlements.map((s, idx) => (
                    <Card key={idx} className="flex flex-row items-center justify-between p-3">
                      <div>
                        <span className="text-foreground font-semibold">{s.from.name}</span>
                        <span className="mx-2">→</span>
                        <span className="text-foreground font-semibold">{s.to.name}</span>
                      </div>
                      <div className="text-primary font-bold">{formatCurrency(s.amount)}</div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Modal thêm khoản chi */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="dark:bg-background relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <button
                className="text-muted-foreground hover:text-foreground absolute top-2 right-2"
                onClick={() => setShowExpenseModal(false)}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="mb-4 text-lg font-semibold">Thêm khoản chi</h2>
              <SplitBillExpenseForm members={group.members} onSubmit={handleAddExpense} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
