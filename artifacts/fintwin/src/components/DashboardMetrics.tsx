import { formatCurrency, formatPercent } from "@/lib/utils";
import { SimulationResult } from "@workspace/api-client-react";
import { TrendingUp, ArrowRightLeft, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardMetricsProps {
  simulation?: SimulationResult;
  isLoading: boolean;
}

export function DashboardMetrics({ simulation, isLoading }: DashboardMetricsProps) {
  
  const MetricCard = ({ title, value, subtext, icon: Icon, delay, highlight = false }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`glass-panel rounded-2xl p-6 relative overflow-hidden group ${highlight ? 'ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''}`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
          <Sparkles className="w-16 h-16 text-emerald-400" />
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      </div>
      
      <div className="space-y-1">
        {isLoading ? (
          <div className="h-10 w-32 bg-slate-800 rounded animate-pulse" />
        ) : (
          <div className={`text-4xl font-display font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
            {value}
          </div>
        )}
        <p className="text-sm text-slate-500 font-medium">{subtext}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard 
        title="Monthly Cash Flow" 
        value={simulation ? formatCurrency(simulation.monthlyCashFlow) : "$0"} 
        subtext="Income minus expenses"
        icon={ArrowRightLeft}
        delay={0.1}
      />
      <MetricCard 
        title="Savings Rate" 
        value={simulation ? formatPercent(simulation.savingsRate) : "0%"} 
        subtext="Percentage of income saved"
        icon={Target}
        delay={0.2}
      />
      <MetricCard 
        title="Projected Net Worth" 
        value={simulation ? formatCurrency(simulation.finalNetWorth) : "$0"} 
        subtext="At end of simulation period"
        icon={TrendingUp}
        delay={0.3}
        highlight={true}
      />
    </div>
  );
}
