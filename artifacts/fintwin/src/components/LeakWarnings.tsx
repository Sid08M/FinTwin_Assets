import { FinancialData } from "@/hooks/use-finance";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

interface LeakWarningsProps {
  data: FinancialData;
}

export function LeakWarnings({ data }: LeakWarningsProps) {
  const totalExpenses = data.monthlyExpensesNeeds + data.monthlyExpensesWants;
  const expenseRatio = totalExpenses / data.monthlyIncome;
  
  if (expenseRatio <= 0.8) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-50 min-h-[140px]">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
          <TrendingDown className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-slate-300 font-medium">No major money leaks detected.</p>
        <p className="text-sm text-slate-500 mt-1">Keep optimizing.</p>
      </div>
    );
  }

  // Calculate the 10-year impact of plugging a 5% leak
  const leakAmount = totalExpenses * 0.05;
  const r = data.annualReturn / 100;
  const n = 12;
  const t = 10;
  // Future Value of Annuity formula
  const impact10Year = leakAmount * ((Math.pow(1 + r/n, n*t) - 1) / (r/n));

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="rounded-2xl p-[1px] bg-gradient-to-br from-destructive to-orange-500 relative overflow-hidden group"
    >
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-destructive/20"
      />
      <div className="bg-slate-950/90 w-full rounded-2xl p-6 relative z-10 flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-destructive/20 text-destructive">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white">Critical Money Leak</h3>
            <p className="text-destructive font-medium text-sm">Expense Ratio: {(expenseRatio * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            You are spending over 80% of your income. Trimming just 5% of your expenses (<strong className="text-white">{formatCurrency(leakAmount)}/mo</strong>) and investing it changes everything.
          </p>
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">10-Year Net Worth Impact</p>
            <p className="text-2xl font-display font-bold text-white">
              +{formatCurrency(impact10Year)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
