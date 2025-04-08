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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/10 via-background/50 to-background/80">
      <Header />
      <div className="container mx-auto max-w-6xl">
        <div className="py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
              <Button
                onClick={() => router.push(ROUTES.TRANSACTIONS + "/new")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo giao dịch
              </Button>
            </div>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Tổng thu
                  </h3>
                  <ArrowUpCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-emerald-500 mt-2">
                  {formatCurrency(summary?.totalIncome || 0)}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/40 via-emerald-500/20 to-emerald-500/40" />
            </Card>

            <Card className="relative border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Tổng chi
                  </h3>
                  <ArrowDownCircle className="w-6 h-6 text-rose-500" />
                </div>
                <p className="text-2xl font-bold text-rose-500 mt-2">
                  {formatCurrency(summary?.totalExpense || 0)}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/40 via-rose-500/20 to-rose-500/40" />
            </Card>

            <Card className="relative border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Số dư
                  </h3>
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    summary?.balance && summary.balance >= 0
                      ? "text-primary"
                      : "text-rose-500"
                  }`}
                >
                  {formatCurrency(summary?.balance || 0)}
                </p>
              </div>
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  summary?.balance && summary.balance >= 0
                    ? "from-primary/40 via-primary/20 to-primary/40"
                    : "from-rose-500/40 via-rose-500/20 to-rose-500/40"
                }`}
              />
            </Card>
          </div>

          <Card className="border bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold tracking-tight">
                  Giao dịch gần đây
                </h2>
              </div>
              <div className="space-y-6">
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
                          className="sticky top-0 bg-background/95 backdrop-blur-sm py-2"
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
                        className="flex items-center justify-between p-4 rounded-lg border bg-background/50 hover:bg-accent/40 transition-all hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          {transaction.type === "INCOME" ? (
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-rose-500 rotate-180" />
                          )}
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
  );
}
