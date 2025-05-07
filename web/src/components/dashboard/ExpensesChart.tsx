import { useMediaQuery } from '@/hooks/use-media-query';
import { useExpensesByCategory } from '@/hooks/use-transactions';
import { formatCurrency, formatShortNumber } from '@/lib/utils';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ExpensesChartProps {
  startDate?: Date;
  endDate?: Date;
}

const GRADIENTS = [
  { id: 'bar-gradient-emerald', from: '#10B981', to: '#059669' },
  { id: 'bar-gradient-blue', from: '#3B82F6', to: '#2563EB' },
  { id: 'bar-gradient-indigo', from: '#6366F1', to: '#4F46E5' },
  { id: 'bar-gradient-violet', from: '#8B5CF6', to: '#7C3AED' },
  { id: 'bar-gradient-pink', from: '#EC4899', to: '#DB2777' },
  { id: 'bar-gradient-rose', from: '#F43F5E', to: '#E11D48' },
  { id: 'bar-gradient-orange', from: '#F97316', to: '#EA580C' },
  { id: 'bar-gradient-yellow', from: '#EAB308', to: '#CA8A04' },
];

export function ExpensesChart({ startDate, endDate }: ExpensesChartProps) {
  const { data: expenses } = useExpensesByCategory({
    startDate,
    endDate,
  });
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (!expenses?.length) {
    return (
      <div className="text-muted-foreground flex h-[400px] items-center justify-center">
        Không có dữ liệu chi tiêu
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full">
      <div className="absolute top-0 left-0 z-10 w-full text-center">
        <h2
          className={
            isMobile ? 'mt-2 mb-2 text-base font-semibold' : 'mt-2 mb-4 text-xl font-semibold'
          }
        >
          Biểu đồ chi tiêu theo danh mục
        </h2>
      </div>
      <div className="from-background/60 to-background/20 absolute inset-0 rounded-xl bg-gradient-to-br backdrop-blur-sm" />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={expenses} margin={{ top: 48, right: 24, left: 0, bottom: 0 }}>
          <defs>
            {GRADIENTS.map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={g.from} stopOpacity={0.9} />
                <stop offset="100%" stopColor={g.to} stopOpacity={0.9} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="categoryName" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis tickFormatter={formatShortNumber} tick={{ fontSize: isMobile ? 10 : 12 }} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `Danh mục: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
            wrapperStyle={{ outline: 'none' }}
            itemStyle={{ color: 'inherit', fontSize: isMobile ? '0.875rem' : '1rem' }}
            labelStyle={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              fontSize: isMobile ? '11px' : '12px',
              marginTop: isMobile ? '8px' : '20px',
            }}
          />
          <Bar dataKey="total" name="Chi tiêu" radius={[6, 6, 0, 0]}>
            {expenses.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={`url(#${GRADIENTS[idx % GRADIENTS.length].id})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
