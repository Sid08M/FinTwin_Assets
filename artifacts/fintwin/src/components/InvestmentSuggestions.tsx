import { FinancialData } from "@/hooks/use-finance";
import {
  Investment,
  RecommendationResult,
  TIER_META,
  RiskTier,
} from "@/lib/investments";
import { formatCurrency, CurrencyCode } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  TrendingUp,
  FlaskConical,
  X,
  Zap,
  Lock,
  Droplets,
} from "lucide-react";

interface InvestmentSuggestionsProps {
  data: FinancialData;
  result: RecommendationResult;
  currency: CurrencyCode;
  activeInvestment: Investment | null;
  onSimulate: (investment: Investment | null) => void;
}

const TIER_ORDER: RiskTier[] = ["emergency", "conservative", "moderate", "aggressive"];

const LIQUIDITY_ICON = {
  high: <Droplets className="w-3 h-3 text-blue-400" />,
  medium: <Zap className="w-3 h-3 text-yellow-400" />,
  low: <Lock className="w-3 h-3 text-slate-500" />,
};

function InvestmentCard({
  investment,
  isActive,
  onSimulate,
}: {
  investment: Investment;
  isActive: boolean;
  onSimulate: (inv: Investment | null) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl p-[1px] transition-all ${
        isActive
          ? "shadow-[0_0_20px_rgba(251,191,36,0.25)]"
          : "hover:shadow-[0_0_14px_rgba(255,255,255,0.04)]"
      }`}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${investment.color}60, #f59e0b60)`
          : `linear-gradient(135deg, ${investment.color}30, transparent)`,
      }}
    >
      <div className="bg-slate-900/95 rounded-2xl p-5 h-full flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              {investment.ticker}
            </p>
            <h4 className="text-white font-semibold text-sm leading-tight">
              {investment.name}
            </h4>
          </div>
          <span
            className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg"
            style={{ backgroundColor: `${investment.color}20`, color: investment.color }}
          >
            {investment.badge}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-xs leading-relaxed flex-1">{investment.description}</p>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            {LIQUIDITY_ICON[investment.liquidity]}
            <span className="capitalize">{investment.liquidity} liquidity</span>
            {investment.taxFree && (
              <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold">
                TAX-FREE
              </span>
            )}
          </div>
          <button
            onClick={() => onSimulate(isActive ? null : investment)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              isActive
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
            }`}
          >
            {isActive ? (
              <>
                <X className="w-3 h-3" /> Clear
              </>
            ) : (
              <>
                <FlaskConical className="w-3 h-3" /> Test
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function InvestmentSuggestions({
  data,
  result,
  currency,
  activeInvestment,
  onSimulate,
}: InvestmentSuggestionsProps) {
  const { needsEmergencyFund, emergencyFundGap, monthlyToTarget, recommendations } = result;

  // Group recommendations by tier
  const grouped = TIER_ORDER.reduce<Record<string, Investment[]>>((acc, tier) => {
    const items = recommendations.filter((i) => i.tier === tier);
    if (items.length) acc[tier] = items;
    return acc;
  }, {});

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Smart Investment Picks
          </h3>
          <p className="text-slate-400 text-sm mt-0.5">
            Based on your current financial snapshot
          </p>
        </div>
        {activeInvestment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Simulating: {activeInvestment.ticker}
          </motion.div>
        )}
      </div>

      {/* Emergency Fund Warning */}
      <AnimatePresence>
        {needsEmergencyFund && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 bg-blue-500/10 border border-blue-500/30 flex gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-blue-300 font-semibold text-sm">
                Build your 6-month emergency fund before taking market risks
              </p>
              <p className="text-slate-400 text-xs">
                You need{" "}
                <strong className="text-white">
                  {formatCurrency(emergencyFundGap, currency)}
                </strong>{" "}
                more to reach your safety target
                {isFinite(monthlyToTarget) && (
                  <>
                    {" "}—{" "}
                    <strong className="text-blue-300">
                      ~{monthlyToTarget} month
                      {monthlyToTarget !== 1 ? "s" : ""} at current savings rate
                    </strong>
                  </>
                )}
                . Until then, stick to high-liquidity options below.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Investment Cards grouped by tier */}
      {Object.entries(grouped).map(([tier, items]) => {
        const meta = TIER_META[tier as RiskTier];
        return (
          <div key={tier} className="space-y-3">
            <h4 className={`text-xs uppercase tracking-wider font-bold ${meta.color}`}>
              {meta.label}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((inv) => (
                <InvestmentCard
                  key={inv.id}
                  investment={inv}
                  isActive={activeInvestment?.id === inv.id}
                  onSimulate={onSimulate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
