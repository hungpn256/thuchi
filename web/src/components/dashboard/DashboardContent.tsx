'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { addDays, endOfDay, format, isEqual, parseISO, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet, Clock, TrendingUp, Tag } from 'lucide-react';
import {
  useTransactionList,
  useTransactionSummary,
  type Transaction,
} from '@/hooks/use-transactions';
import { ExpensesChart } from './ExpensesChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionForm } from '@/components/transaction/transaction-form';
import { TransactionAmount } from '@/components/ui/transaction-amount';
import { InstallPWA } from '@/components/common/InstallPWA';

export default function DashboardContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(addDays(new Date(), -30)),
    to: endOfDay(new Date()),
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: summary } = useTransactionSummary({
    startDate: dateRange?.from,
    endDate: dateRange?.to,
  });

  const { data: transactions } = useTransactionList({
    startDate: dateRange?.from,
    endDate: dateRange?.to,
    limit: 10,
    page: 1,
  });

  const handleDateRangeChange = (date: DateRange | undefined) => {
    setDateRange({
      from: date?.from ? startOfDay(date.from) : new Date(),
      to: date?.to ? endOfDay(date.to) : new Date(),
    });
  };

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="from-background/95 via-background/80 to-primary/10 relative min-h-screen bg-gradient-to-br">
      <div className="from-primary/10 pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-transparent to-transparent" />
      <div className="relative container mx-auto max-w-6xl p-2">
        <div className="space-y-4 py-4">
          <div className="from-background/90 via-background/70 to-background/50 flex items-center justify-between rounded-xl border bg-gradient-to-r p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="from-primary/20 absolute inset-0 bg-gradient-to-r to-transparent blur-xl" />
                <h1 className="relative text-2xl font-semibold tracking-tight">Tổng quan</h1>
              </div>
              <Button
                onClick={handleCreateClick}
                className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-primary/20 group relative overflow-hidden bg-gradient-to-r text-sm shadow-lg"
                size="sm"
              >
                <div className="from-primary-foreground/10 absolute inset-0 bg-gradient-to-r to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Tạo giao dịch
              </Button>
            </div>
            <DatePickerWithRange date={dateRange} setDate={handleDateRangeChange} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="from-background/80 group relative overflow-hidden border bg-gradient-to-br to-emerald-500/10 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 p-2 shadow-inner">
                    <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">Thu</h3>
                    <p className="text-lg font-bold text-emerald-500 drop-shadow-sm">
                      {formatCurrency(summary?.totalIncome || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500/50 via-emerald-500/30 to-emerald-500/50" />
            </Card>

            <Card className="from-background/80 group relative overflow-hidden border bg-gradient-to-br to-rose-500/10 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-br from-rose-500/30 to-rose-500/10 p-2 shadow-inner">
                    <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">Chi</h3>
                    <p className="text-lg font-bold text-rose-500 drop-shadow-sm">
                      {formatCurrency(summary?.totalExpense || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-rose-500/50 via-rose-500/30 to-rose-500/50" />
            </Card>

            <Card className="from-background/80 to-primary/10 group relative overflow-hidden border bg-gradient-to-br shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div
                className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100 ${
                  summary?.balance && summary.balance >= 0
                    ? 'from-primary/5 to-transparent'
                    : 'from-rose-500/5 to-transparent'
                }`}
              />
              <div className="relative p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full bg-gradient-to-br p-2 shadow-inner ${
                      summary?.balance && summary.balance >= 0
                        ? 'from-primary/30 to-primary/10'
                        : 'from-rose-500/30 to-rose-500/10'
                    }`}
                  >
                    <Wallet
                      className={`h-4 w-4 ${
                        summary?.balance && summary.balance >= 0 ? 'text-primary' : 'text-rose-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">Số dư</h3>
                    <p
                      className={`text-lg font-bold drop-shadow-sm ${
                        summary?.balance && summary.balance >= 0 ? 'text-primary' : 'text-rose-500'
                      }`}
                    >
                      {formatCurrency(summary?.balance || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r ${
                  summary?.balance && summary.balance >= 0
                    ? 'from-primary/50 via-primary/30 to-primary/50'
                    : 'from-rose-500/50 via-rose-500/30 to-rose-500/50'
                }`}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="from-background/80 via-background/60 to-background/40 group relative overflow-hidden border bg-gradient-to-br shadow-lg backdrop-blur-md">
              <div className="from-primary/5 absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative p-4">
                <ExpensesChart startDate={dateRange?.from} endDate={dateRange?.to} />
              </div>
            </Card>

            <Card className="from-background/80 via-background/60 to-background/40 group relative overflow-hidden border bg-gradient-to-br shadow-lg backdrop-blur-md">
              <div className="from-primary/5 absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="from-muted/30 to-muted/10 rounded-full bg-gradient-to-br p-1.5 shadow-inner">
                    <Clock className="text-muted-foreground h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">Giao dịch gần đây</h2>
                </div>
                <div className="space-y-4">
                  {transactions?.items.reduce(
                    (
                      acc: React.ReactNode[],
                      transaction: Transaction,
                      index: number,
                      array: Transaction[],
                    ) => {
                      const transactionDate = parseISO(transaction.date);
                      const prevDate = index > 0 ? parseISO(array[index - 1].date) : null;

                      if (index === 0 || !prevDate || !isEqual(transactionDate, prevDate)) {
                        acc.push(
                          <div
                            key={`date-${transaction.date}-${transaction.id}`}
                            className="from-background/95 via-background/90 to-background/80 sticky top-0 z-10 bg-gradient-to-r py-2 backdrop-blur-md"
                          >
                            <p className="text-muted-foreground text-sm font-medium">
                              {format(transactionDate, 'EEEE, dd/MM/yyyy', {
                                locale: vi,
                              })}
                            </p>
                          </div>,
                        );
                      }

                      acc.push(
                        <div
                          key={transaction.id}
                          className="from-background/60 to-background/40 hover:from-accent/30 hover:to-accent/10 group/item flex items-center justify-between rounded-lg border bg-gradient-to-r p-3 transition-all hover:shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-full p-1.5 transition-colors ${
                                transaction.type === 'INCOME'
                                  ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-500/10'
                                  : 'bg-gradient-to-br from-rose-500/30 to-rose-500/10'
                              }`}
                            >
                              {transaction.type === 'INCOME' ? (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <TrendingUp className="h-4 w-4 rotate-180 text-rose-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Tag className="h-3 w-3" />
                                <span>{transaction.category.name}</span>
                              </div>
                            </div>
                          </div>
                          <p
                            className={`font-semibold ${
                              transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}{' '}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>,
                      );

                      return acc;
                    },
                    [],
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Create Transaction Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tạo giao dịch mới</DialogTitle>
              </DialogHeader>
              <TransactionForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <InstallPWA />
    </div>
  );
}
