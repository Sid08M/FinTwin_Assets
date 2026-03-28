import { formatCurrency, CurrencyCode } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";

interface DeltaPanelProps {
  netWorthDelta: number | null;
  baselineSavingsRate: number | null;
  currentSavingsRate: number | null;
  currency: CurrencyCode;
}

export function DeltaPanel({ netWorthDelta, baselineSavingsRate, currentSavingsRate, currency }: DeltaPanelProps) {
  if (netWorthDelta === null || baselineSavingsRate === null || currentSavingsRate === null) {
    return null;
  }

  const isPositive = netWorthDelta > 0;
  const isNeutral = netWorthDelta === 0;
  const savingsDelta = currentSavingsRate - baselineSavingsRate;
  const absDelta = Math.abs(netWorthDelta);

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border transition-all
        ${isPositive
          ? "bg-emerald-500/8 border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.07)]"
          : isNeutral
          ? "bg-slate-800/50 border-slate-700/50"
          : "bg-red-500/8 border-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.07)]"
        }`}
    >
      <div className={`p-3 rounded-xl shrink-0 ${isPositive ? "bg-emerald-500/15" : isNeutral ? "bg-slate-700/60" : "bg-red-500/15"}`}>
        <History className={`w-5 h-5 ${isPositive ? "text-emerald-400" : isNeutral ? "text-slate-400" : "text-red-400"}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <span>Shadow Twin · Since your first save</span>
        </p>
        <p className="text-white font-medium text-sm leading-relaxed">
          Since your first visit, your new habits have changed your 10-year outlook by{" "}
          <span className={`font-bold font-display text-lg ${isPositive ? "text-emerald-400" : isNeutral ? "text-slate-300" : "text-red-400"}`}>
            {isPositive ? "+" : isNeutral ? "" : "-"}{formatCurrency(absDelta, currency)}
          </span>
          {!isNeutral && (
            <span className={`ml-1 text-sm ${isPositive ? "text-emerald-300" : "text-red-300"}`}>
              {isPositive ? "🚀 ahead" : "⚠️ behind"}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-0.5">Savings Rate</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-slate-400">{baselineSavingsRate}%</span>
            <Icon className={`w-3.5 h-3.5 ${isPositive ? "text-emerald-400" : isNeutral ? "text-slate-400" : "text-red-400"}`} />
            <span className={`text-sm font-bold ${isPositive ? "text-emerald-400" : isNeutral ? "text-slate-300" : "text-red-400"}`}>
              {currentSavingsRate}%
            </span>
          </div>
          <p className={`text-xs font-semibold ${savingsDelta > 0 ? "text-emerald-400" : savingsDelta < 0 ? "text-red-400" : "text-slate-400"}`}>
            {savingsDelta > 0 ? `+${savingsDelta.toFixed(1)}` : savingsDelta.toFixed(1)}% change
          </p>
        </div>
      </div>
    </motion.div>
  );
}
