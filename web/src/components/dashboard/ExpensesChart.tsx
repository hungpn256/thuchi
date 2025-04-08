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
  "#10B981",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F43F5E",
  "#F97316",
  "#EAB308",
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
        <ChartPie className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight">
          Chi phí theo danh mục
        </h2>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenses}
              dataKey="total"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={120}
              paddingAngle={2}
              label={({ categoryName, percent }) =>
                `${categoryName} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {expenses.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "8px",
                padding: "8px",
                border: "none",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
