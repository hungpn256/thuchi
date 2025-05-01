import { Card } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OverviewCardProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export function OverviewCard({ totalIncome, totalExpense, balance }: OverviewCardProps) {
  return (
    <Card className="from-background/80 group to-primary/10 relative overflow-hidden border bg-gradient-to-br shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-gradient-to-br from-emerald-500/5 to-transparent p-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 p-1.5 shadow-inner">
                <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <h3 className="text-muted-foreground text-xs font-medium">Thu</h3>
            </div>
            <p className="text-base font-bold text-emerald-500 drop-shadow-sm">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gradient-to-br from-rose-500/5 to-transparent p-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-gradient-to-br from-rose-500/30 to-rose-500/10 p-1.5 shadow-inner">
                <ArrowDownCircle className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <h3 className="text-muted-foreground text-xs font-medium">Chi</h3>
            </div>
            <p className="text-base font-bold text-rose-500 drop-shadow-sm">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          <div className="from-primary/5 flex items-center justify-between rounded-lg bg-gradient-to-br to-transparent p-2">
            <div className="flex items-center gap-2">
              <div
                className={`rounded-full bg-gradient-to-br p-1.5 shadow-inner ${
                  balance >= 0 ? 'from-primary/30 to-primary/10' : 'from-rose-500/30 to-rose-500/10'
                }`}
              >
                <Wallet
                  className={`h-3.5 w-3.5 ${balance >= 0 ? 'text-primary' : 'text-rose-500'}`}
                />
              </div>
              <h3 className="text-muted-foreground text-xs font-medium">Số dư</h3>
            </div>
            <p
              className={`text-base font-bold drop-shadow-sm ${
                balance >= 0 ? 'text-primary' : 'text-rose-500'
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>
      <div
        className={`absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r ${
          balance >= 0
            ? 'from-primary/50 via-primary/30 to-primary/50'
            : 'from-rose-500/50 via-rose-500/30 to-rose-500/50'
        }`}
      />
    </Card>
  );
}
