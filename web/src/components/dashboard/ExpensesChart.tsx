import { useExpensesByCategory } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import { ChartPie } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ExpensesChartProps {
  startDate?: Date;
  endDate?: Date;
}

const COLORS = [
  { start: "#10B981", end: "#059669" }, // Emerald
  { start: "#3B82F6", end: "#2563EB" }, // Blue
  { start: "#6366F1", end: "#4F46E5" }, // Indigo
  { start: "#8B5CF6", end: "#7C3AED" }, // Violet
  { start: "#EC4899", end: "#DB2777" }, // Pink
  { start: "#F43F5E", end: "#E11D48" }, // Rose
  { start: "#F97316", end: "#EA580C" }, // Orange
  { start: "#EAB308", end: "#CA8A04" }, // Yellow
];

export function ExpensesChart({ startDate, endDate }: ExpensesChartProps) {
  const { data: expenses } = useExpensesByCategory({
    startDate,
    endDate,
  });

  if (!expenses?.length) {
    return <div />;
  }

  return (
    <div className="p-2">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 rounded-full bg-gradient-to-br from-muted/20 to-muted/5">
          <ChartPie className="w-4 h-4 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">
          Chi phí theo danh mục
        </h2>
      </div>
      <div className="h-[400px] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-background/60 to-background/20 backdrop-blur-sm rounded-xl" />
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
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={4}
              label={({ categoryName, percent }) =>
                `${categoryName} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
              animationBegin={200}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {expenses.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${index % COLORS.length})`}
                  className="transition-all duration-300 hover:opacity-80"
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                borderRadius: "12px",
                padding: "8px 12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm font-medium">{value}</span>
              )}
              iconType="circle"
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
