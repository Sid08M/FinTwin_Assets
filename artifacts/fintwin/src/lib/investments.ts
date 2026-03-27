import { FinancialData } from "@/hooks/use-finance";

export type RiskTier = "emergency" | "conservative" | "moderate" | "aggressive";

export interface Investment {
  id: string;
  name: string;
  ticker: string;
  annualReturn: number;
  tier: RiskTier;
  taxFree: boolean;
  liquidity: "high" | "medium" | "low";
  description: string;
  color: string;
  badge: string;
}

export const INVESTMENTS: Investment[] = [
  // Emergency / Liquid
  {
    id: "sweep-fd",
    name: "SBI Sweep-in Fixed Deposit",
    ticker: "SBI FD",
    annualReturn: 7.1,
    tier: "emergency",
    taxFree: false,
    liquidity: "high",
    description: "Instant-access savings with FD-level returns. Your emergency fund home.",
    color: "#3b82f6",
    badge: "7.1% p.a.",
  },
  {
    id: "liquid-mf",
    name: "Liquid Mutual Funds",
    ticker: "Liquid MF",
    annualReturn: 6.5,
    tier: "emergency",
    taxFree: false,
    liquidity: "high",
    description: "Same-day redemption. Beats savings accounts handily.",
    color: "#06b6d4",
    badge: "~6.5% p.a.",
  },
  // Conservative
  {
    id: "ppf",
    name: "Public Provident Fund",
    ticker: "PPF",
    annualReturn: 7.1,
    tier: "conservative",
    taxFree: true,
    liquidity: "low",
    description: "Government-backed, completely tax-free under EEE. The ultimate safe compounder.",
    color: "#10b981",
    badge: "7.1% p.a. Tax-Free",
  },
  {
    id: "sgb",
    name: "Sovereign Gold Bonds",
    ticker: "SGB",
    annualReturn: 9.5,
    tier: "conservative",
    taxFree: false,
    liquidity: "medium",
    description: "2.5% annual interest + gold price appreciation. Backed by RBI.",
    color: "#f59e0b",
    badge: "~9.5% p.a.",
  },
  // Moderate
  {
    id: "nifty50",
    name: "Nifty 50 Index Fund",
    ticker: "NIFTY 50",
    annualReturn: 12,
    tier: "moderate",
    taxFree: false,
    liquidity: "medium",
    description: "India's top 50 companies, low-cost passive exposure. 15-year CAGR ~12%.",
    color: "#8b5cf6",
    badge: "~12% p.a.",
  },
  {
    id: "hybrid",
    name: "Aggressive Hybrid Funds",
    ticker: "Hybrid",
    annualReturn: 11,
    tier: "moderate",
    taxFree: false,
    liquidity: "medium",
    description: "65–80% equity + 20–35% debt. Smoother ride than pure equity.",
    color: "#a78bfa",
    badge: "~11% p.a.",
  },
  // Aggressive
  {
    id: "smallcap",
    name: "Small Cap Mutual Funds",
    ticker: "Small Cap",
    annualReturn: 15,
    tier: "aggressive",
    taxFree: false,
    liquidity: "medium",
    description: "High volatility, high reward. Best for 7+ year horizon. Historical CAGR 15–18%.",
    color: "#f97316",
    badge: "15%+ p.a.",
  },
  {
    id: "bluechip",
    name: "Direct Bluechip Equities",
    ticker: "Bluechip",
    annualReturn: 13,
    tier: "aggressive",
    taxFree: false,
    liquidity: "low",
    description: "Own India's giants directly. Requires research, rewards conviction.",
    color: "#ef4444",
    badge: "~13% p.a.",
  },
];

export interface RecommendationResult {
  needsEmergencyFund: boolean;
  emergencyFundGap: number;
  monthlyToTarget: number;
  recommendations: Investment[];
}

export function getRecommendations(data: FinancialData): RecommendationResult {
  const totalExpenses = data.monthlyExpensesNeeds + data.monthlyExpensesWants;
  const emergencyTarget = totalExpenses * 6;
  const needsEmergencyFund = data.currentSavings < emergencyTarget;
  const emergencyFundGap = Math.max(0, emergencyTarget - data.currentSavings);

  // Months to close the gap at current savings rate
  const monthlyToTarget =
    data.monthlySavings > 0 ? Math.ceil(emergencyFundGap / data.monthlySavings) : Infinity;

  let recommendations: Investment[];

  if (needsEmergencyFund) {
    recommendations = INVESTMENTS.filter((i) => i.tier === "emergency");
  } else {
    const surplus = data.monthlyIncome - totalExpenses;
    if (surplus < 5000) {
      // Low surplus — conservative only
      recommendations = INVESTMENTS.filter((i) =>
        ["conservative"].includes(i.tier)
      );
    } else if (surplus < 20000) {
      // Moderate surplus
      recommendations = INVESTMENTS.filter((i) =>
        ["conservative", "moderate"].includes(i.tier)
      );
    } else {
      // Good surplus — full range
      recommendations = INVESTMENTS.filter((i) =>
        ["conservative", "moderate", "aggressive"].includes(i.tier)
      );
    }
  }

  return { needsEmergencyFund, emergencyFundGap, monthlyToTarget, recommendations };
}

export const TIER_META: Record<RiskTier, { label: string; color: string }> = {
  emergency: { label: "Emergency / Liquid", color: "text-blue-400" },
  conservative: { label: "Conservative", color: "text-emerald-400" },
  moderate: { label: "Moderate", color: "text-purple-400" },
  aggressive: { label: "Aggressive", color: "text-orange-400" },
};

/** FV of Annuity — computes year-by-year net worth for a given annual return */
export function computeOverlaySeries(
  data: FinancialData,
  annualReturn: number
): { year: number; overlayNetWorth: number }[] {
  const r = annualReturn / 100 / 12; // monthly rate
  const pmt = data.monthlySavings;
  let pv = data.currentSavings;
  const result = [];

  for (let y = 1; y <= data.years; y++) {
    const months = y * 12;
    // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
    const fv =
      r === 0
        ? pv + pmt * months
        : pv * Math.pow(1 + r, months) + pmt * ((Math.pow(1 + r, months) - 1) / r);
    result.push({ year: y, overlayNetWorth: Math.round(fv) });
  }
  return result;
}
