import { FinancialData } from "@/hooks/use-finance";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatPercent } from "@/lib/utils";
import { motion } from "framer-motion";

interface BudgetGaugeProps {
  data: FinancialData;
}

export function BudgetGauge({ data }: BudgetGaugeProps) {
  const needsRatio = data.monthlyExpensesNeeds / data.monthlyIncome;
  const wantsRatio = data.monthlyExpensesWants / data.monthlyIncome;
  const savingsRatio = data.monthlySavings / data.monthlyIncome;

  const leftover = Math.max(0, 1 - (needsRatio + wantsRatio + savingsRatio));

  const chartData = [
    { name: "Needs (Target 50%)", value: needsRatio * 100, color: needsRatio > 0.5 ? "#ef4444" : "#3b82f6", exceeds: needsRatio > 0.5 },
    { name: "Wants (Target 30%)", value: wantsRatio * 100, color: wantsRatio > 0.3 ? "#f97316" : "#a855f7", exceeds: wantsRatio > 0.3 },
    { name: "Savings (Target 20%)", value: savingsRatio * 100, color: "#10b981", exceeds: false },
    ...(leftover > 0 ? [{ name: "Unallocated", value: leftover * 100, color: "#1e293b", exceeds: false }] : [])
  ];

  const hasWarning = chartData.some(d => d.exceeds);

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] cursor-default">
      {hasWarning && (
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-destructive/10 pointer-events-none"
        />
      )}

      <div className="mb-4">
        <h3 className="text-lg font-display font-bold text-white">50/30/20 Rule</h3>
        <p className="text-slate-400 text-sm">Budget distribution vs targets</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className={entry.exceeds ? "animate-pulse" : ""}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatPercent(value)}
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }}
              itemStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-2">
          <span className="text-2xl font-display font-bold text-white">{formatPercent(savingsRatio * 100)}</span>
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Saved</span>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {chartData.filter(d => d.name !== "Unallocated").map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300">{item.name.split(" (")[0]}</span>
            </div>
            <span className={`font-medium ${item.exceeds ? "text-destructive font-bold" : "text-white"}`}>
              {item.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
