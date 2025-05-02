import { useMediaQuery } from '@/hooks/use-media-query';
import { useExpensesByCategory } from '@/hooks/use-transactions';
import { formatCurrency } from '@/lib/utils';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpensesChartProps {
  startDate?: Date;
  endDate?: Date;
}

const COLORS = [
  { start: '#10B981', end: '#059669' }, // Emerald
  { start: '#3B82F6', end: '#2563EB' }, // Blue
  { start: '#6366F1', end: '#4F46E5' }, // Indigo
  { start: '#8B5CF6', end: '#7C3AED' }, // Violet
  { start: '#EC4899', end: '#DB2777' }, // Pink
  { start: '#F43F5E', end: '#E11D48' }, // Rose
  { start: '#F97316', end: '#EA580C' }, // Orange
  { start: '#EAB308', end: '#CA8A04' }, // Yellow
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

  const outerRadius = isMobile ? 140 : 160;
  const innerRadius = isMobile ? 70 : 80;

  return (
    <div className={`relative ${isMobile ? 'h-[450px]' : 'h-[450px]'}`}>
      <div className="from-background/60 to-background/20 absolute inset-0 rounded-xl bg-gradient-to-br backdrop-blur-sm" />
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <radialGradient
                key={`gradient-${index}`}
                id={`gradient-${index}`}
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor={color.start} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color.end} stopOpacity={0.9} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={expenses}
            dataKey="total"
            nameKey="categoryName"
            cx="50%"
            cy="42%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={4}
            label={false}
            labelLine={false}
            animationBegin={200}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {expenses.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#gradient-${index % COLORS.length})`}
                className="transition-all duration-300 hover:scale-105 hover:opacity-80"
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${formatCurrency(value)}`, name]}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
            wrapperStyle={{
              outline: 'none',
            }}
            itemStyle={{
              color: 'inherit',
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
            labelStyle={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
            labelFormatter={() => ''}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            content={({ payload }) => (
              <ul
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: isMobile ? '4px' : '8px',
                  marginTop: isMobile ? '8px' : '20px',
                  padding: isMobile ? '0 4px' : '0 8px',
                }}
              >
                {payload?.map((entry, index) => (
                  <li
                    key={`item-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginRight: isMobile ? '6px' : '10px',
                      cursor: 'pointer',
                    }}
                    className="opacity-70 transition-opacity duration-200 hover:opacity-100"
                  >
                    <svg
                      width={isMobile ? '8' : '10'}
                      height={isMobile ? '8' : '10'}
                      viewBox="0 0 10 10"
                      style={{ marginRight: isMobile ? '2px' : '4px' }}
                    >
                      <circle cx="5" cy="5" r="5" fill={entry.color} />
                    </svg>
                    <span
                      className="truncate text-xs font-medium sm:text-sm"
                      style={{ maxWidth: isMobile ? '100px' : '120px' }}
                    >
                      {entry.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
