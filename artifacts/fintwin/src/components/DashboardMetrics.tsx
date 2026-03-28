import { formatCurrency, formatPercent, CurrencyCode } from "@/lib/utils";
import { SimulationResult } from "@workspace/api-client-react";
import { TrendingUp, ArrowRightLeft, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ElementType } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: ElementType;
  delay: number;
  highlight?: boolean;
  isLoading: boolean;
}

function MetricCard({ title, value, subtext, icon: Icon, delay, highlight = false, isLoading }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`glass-panel rounded-2xl p-6 relative overflow-hidden group cursor-default
        transition-all duration-300 hover:scale-105
        ${highlight
          ? "ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]"
          : "hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"}`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
          <Sparkles className="w-16 h-16 text-emerald-400" />
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl transition-all duration-300 ${highlight ? "bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30" : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <div className="h-10 w-32 bg-slate-800 rounded animate-pulse" />
        ) : (
          <div className={`text-4xl font-display font-bold transition-colors duration-300 ${highlight ? "text-emerald-400" : "text-white"}`}>
            {value}
          </div>
        )}
        <p className="text-sm text-slate-500 font-medium">{subtext}</p>
      </div>
    </motion.div>
  );
}

interface DashboardMetricsProps {
  simulation?: SimulationResult;
  isLoading: boolean;
  currency: CurrencyCode;
}

export function DashboardMetrics({ simulation, isLoading, currency }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Monthly Cash Flow"
        value={simulation ? formatCurrency(simulation.monthlyCashFlow, currency) : formatCurrency(0, currency)}
        subtext="Income minus expenses"
        icon={ArrowRightLeft}
        delay={0.1}
        isLoading={isLoading}
      />
      <MetricCard
        title="Savings Rate"
        value={simulation ? formatPercent(simulation.savingsRate) : "0%"}
        subtext="Percentage of income saved"
        icon={Target}
        delay={0.2}
        isLoading={isLoading}
      />
      <MetricCard
        title="Projected Net Worth"
        value={simulation ? formatCurrency(simulation.finalNetWorth, currency) : formatCurrency(0, currency)}
        subtext="At end of simulation period"
        icon={TrendingUp}
        delay={0.3}
        highlight={true}
        isLoading={isLoading}
      />
    </div>
  );
}
