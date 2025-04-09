"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  addDays,
  endOfDay,
  format,
  isEqual,
  parseISO,
  startOfDay,
} from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Clock,
  TrendingUp,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app.constant";
import {
  useTransactionList,
  useTransactionSummary,
  type Transaction,
} from "@/hooks/use-transactions";
import { ExpensesChart } from "./ExpensesChart";

export default function DashboardContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(addDays(new Date(), -30)),
    to: endOfDay(new Date()),
  });

  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/95 via-background/80 to-primary/10 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      <Header />
      <div className="container mx-auto max-w-6xl p-2 relative">
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-background/90 via-background/70 to-background/50 backdrop-blur-md border shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent blur-xl" />
                <h1 className="text-2xl font-semibold tracking-tight relative">
                  Tổng quan
                </h1>
              </div>
              <Button
                onClick={() => router.push(ROUTES.TRANSACTIONS + "/new")}
                className="relative bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/20 text-sm overflow-hidden group"
                size="sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Tạo giao dịch
              </Button>
            </div>
            <DatePickerWithRange
              date={dateRange}
              setDate={handleDateRangeChange}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="relative overflow-hidden border bg-gradient-to-br from-background/80 to-emerald-500/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 shadow-inner">
                    <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Thu
                    </h3>
                    <p className="text-lg font-bold text-emerald-500 drop-shadow-sm">
                      {formatCurrency(summary?.totalIncome || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/50 via-emerald-500/30 to-emerald-500/50" />
            </Card>

            <Card className="relative overflow-hidden border bg-gradient-to-br from-background/80 to-rose-500/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-rose-500/30 to-rose-500/10 shadow-inner">
                    <ArrowDownCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Chi
                    </h3>
                    <p className="text-lg font-bold text-rose-500 drop-shadow-sm">
                      {formatCurrency(summary?.totalExpense || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500/50 via-rose-500/30 to-rose-500/50" />
            </Card>

            <Card className="relative overflow-hidden border bg-gradient-to-br from-background/80 to-primary/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
              <div
                className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${
                  summary?.balance && summary.balance >= 0
                    ? "from-primary/5 to-transparent"
                    : "from-rose-500/5 to-transparent"
                }`}
              />
              <div className="p-4 relative">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full shadow-inner bg-gradient-to-br ${
                      summary?.balance && summary.balance >= 0
                        ? "from-primary/30 to-primary/10"
                        : "from-rose-500/30 to-rose-500/10"
                    }`}
                  >
                    <Wallet
                      className={`w-4 h-4 ${
                        summary?.balance && summary.balance >= 0
                          ? "text-primary"
                          : "text-rose-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Số dư
                    </h3>
                    <p
                      className={`text-lg font-bold drop-shadow-sm ${
                        summary?.balance && summary.balance >= 0
                          ? "text-primary"
                          : "text-rose-500"
                      }`}
                    >
                      {formatCurrency(summary?.balance || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                  summary?.balance && summary.balance >= 0
                    ? "from-primary/50 via-primary/30 to-primary/50"
                    : "from-rose-500/50 via-rose-500/30 to-rose-500/50"
                }`}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="relative overflow-hidden border bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-md shadow-lg group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 relative">
                <ExpensesChart
                  startDate={dateRange?.from}
                  endDate={dateRange?.to}
                />
              </div>
            </Card>

            <Card className="relative overflow-hidden border bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-md shadow-lg group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 shadow-inner">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Giao dịch gần đây
                  </h2>
                </div>
                <div className="space-y-4">
                  {transactions?.items.reduce(
                    (
                      acc: React.ReactNode[],
                      transaction: Transaction,
                      index: number,
                      array: Transaction[]
                    ) => {
                      const transactionDate = parseISO(transaction.date);
                      const prevDate =
                        index > 0 ? parseISO(array[index - 1].date) : null;

                      if (
                        index === 0 ||
                        !prevDate ||
                        !isEqual(transactionDate, prevDate)
                      ) {
                        acc.push(
                          <div
                            key={`date-${transaction.date}`}
                            className="sticky top-0 bg-gradient-to-r from-background/95 via-background/90 to-background/80 backdrop-blur-md py-2 z-10"
                          >
                            <p className="text-sm font-medium text-muted-foreground">
                              {format(transactionDate, "EEEE, dd/MM/yyyy", {
                                locale: vi,
                              })}
                            </p>
                          </div>
                        );
                      }

                      acc.push(
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-background/60 to-background/40 hover:from-accent/30 hover:to-accent/10 transition-all hover:shadow-md group/item"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-1.5 rounded-full transition-colors ${
                                transaction.type === "INCOME"
                                  ? "bg-gradient-to-br from-emerald-500/30 to-emerald-500/10"
                                  : "bg-gradient-to-br from-rose-500/30 to-rose-500/10"
                              }`}
                            >
                              {transaction.type === "INCOME" ? (
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-rose-500 rotate-180" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.description}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Tag className="w-3 h-3" />
                                <span>{transaction.category.name}</span>
                              </div>
                            </div>
                          </div>
                          <p
                            className={`font-semibold ${
                              transaction.type === "INCOME"
                                ? "text-emerald-500"
                                : "text-rose-500"
                            }`}
                          >
                            {transaction.type === "INCOME" ? "+" : "-"}{" "}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      );

                      return acc;
                    },
                    []
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
