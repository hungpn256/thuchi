import { useMonthlySummary } from '@/hooks/use-transactions';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  DotProps,
} from 'recharts';

export function MonthlySummaryChart() {
  const { data, isLoading } = useMonthlySummary();

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex h-[450px] items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }
  if (!data?.length) {
    return (
      <div className="text-muted-foreground flex h-[450px] items-center justify-center">
        Không có dữ liệu
      </div>
    );
  }

  // Định dạng lại tháng cho trục X
  const chartData = data.map((item) => {
    const [year, month] = item.month.split('-');
    return {
      month: `${month}/${year}`,
      income: item.totalIncome,
      expense: item.totalExpense,
    };
  });

  // Custom dot with animation and shadow
  const renderDot = (props: DotProps & { color: string }) => {
    const { cx, cy, color, key } = props;
    return (
      <circle
        key={key}
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))', transition: 'r 0.2s' }}
      />
    );
  };

  return (
    <div className="relative aspect-[16/9] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 16, right: 24, left: 8, bottom: 36 }}>
          <defs>
            <linearGradient id="income-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#5eead4" />
            </linearGradient>
            <linearGradient id="expense-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `Tháng: ${label}`}
            contentStyle={{
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 12,
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              color: '#64748b',
              fontSize: 13,
              fontWeight: 500,
            }}
            wrapperStyle={{ outline: 'none' }}
            itemStyle={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}
            labelStyle={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            height={40}
            iconType="circle"
            wrapperStyle={{ fontSize: '14px', marginTop: 12 }}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="Thu"
            stroke="url(#income-gradient)"
            strokeWidth={4}
            dot={(props) => renderDot({ ...props, color: '#6ee7b7' })}
            activeDot={{ r: 9, fill: '#5eead4', stroke: '#fff', strokeWidth: 3 }}
            isAnimationActive={true}
            animationDuration={1200}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Chi"
            stroke="url(#expense-gradient)"
            strokeWidth={2}
            dot={(props) => renderDot({ ...props, color: '#fca5a5' })}
            activeDot={{ r: 9, fill: '#f87171', stroke: '#fff', strokeWidth: 3 }}
            isAnimationActive={true}
            animationDuration={1200}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
