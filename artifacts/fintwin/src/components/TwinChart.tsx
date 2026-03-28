import { SimulationResult } from "@workspace/api-client-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency, CurrencyCode } from "@/lib/utils";
import { Investment, computeOverlaySeries } from "@/lib/investments";
import { FinancialData } from "@/hooks/use-finance";
import { useMemo } from "react";

interface TwinChartProps {
  simulation?: SimulationResult;
  currency: CurrencyCode;
  financialData: FinancialData;
  simulatedInvestment: Investment | null;
  showVolatility: boolean;
  showInflation: boolean;
  shadowSeries: { year: number; netWorth: number }[] | null;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function applyVolatility(value: number, year: number, seed: number): number {
  const fluctuation = (seededRandom(seed + year) - 0.5) * 0.04;
  return Math.round(value * (1 + fluctuation));
}

function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl min-w-[210px]">
      <p className="text-slate-400 font-medium mb-2 text-sm">Year {label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300 text-xs truncate max-w-[110px]">{entry.name}:</span>
          <span className="text-white font-bold font-display text-sm ml-auto">
            {formatCurrency(entry.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

function yAxisTick(val: number, currency: CurrencyCode): string {
  const abs = Math.abs(val);
  if (currency === "JPY" || currency === "INR") {
    if (abs >= 10_000_000) return `${(val / 10_000_000).toFixed(1)}Cr`;
    if (abs >= 100_000) return `${(val / 100_000).toFixed(1)}L`;
    return `${val}`;
  }
  if (abs >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return `${val}`;
}

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "$", AUD: "$", INR: "₹",
};

export function TwinChart({
  simulation,
  currency,
  financialData,
  simulatedInvestment,
  showVolatility,
  showInflation,
  shadowSeries,
}: TwinChartProps) {
  const volatilitySeed = useMemo(() => Math.floor(Math.random() * 1000), []);

  const overlayData = useMemo(() => {
    if (!simulatedInvestment) return null;
    return computeOverlaySeries(financialData, simulatedInvestment.annualReturn);
  }, [simulatedInvestment, financialData]);

  const chartData = useMemo(() => {
    if (!simulation?.yearlyData) return [];
    return simulation.yearlyData.map((point, i) => {
      const nw = showVolatility ? applyVolatility(point.netWorth, point.year, volatilitySeed) : point.netWorth;
      const onw = showVolatility ? applyVolatility(point.optimizedNetWorth, point.year, volatilitySeed + 100) : point.optimizedNetWorth;
      return {
        year: point.year,
        netWorth: nw,
        optimizedNetWorth: onw,
        inflationAdjustedNetWorth: (point as any).inflationAdjustedNetWorth,
        overlayNetWorth: overlayData?.[i]?.overlayNetWorth,
        shadowNetWorth: shadowSeries?.[i]?.netWorth,
      };
    });
  }, [simulation, overlayData, showVolatility, volatilitySeed, shadowSeries]);

  if (!simulation || !simulation.yearlyData) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-[400px] flex items-center justify-center">
        <p className="text-slate-500 animate-pulse font-display">Simulating realities...</p>
      </div>
    );
  }

  const symbol = CURRENCY_SYMBOL[currency];
  const hasShadow = shadowSeries && shadowSeries.length > 0;

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.08)]">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-3">
        <div>
          <h3 className="text-xl font-display font-bold text-white">Twin Trajectories</h3>
          <p className="text-slate-400 text-sm">
            {simulatedInvestment
              ? `Comparing current path vs. ${simulatedInvestment.name}`
              : "You vs. You saving 10% more efficiently."}
            {showVolatility && <span className="ml-2 text-amber-400 text-xs font-semibold">± Market Noise</span>}
            {showInflation && <span className="ml-2 text-orange-400 text-xs font-semibold">Real Purchasing Power</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-xs text-slate-400">Current Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-xs text-emerald-400 font-medium">Optimized Twin</span>
          </div>
          {hasShadow && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-slate-400 opacity-50" style={{ borderTop: "2px dashed #94a3b8" }} />
              <span className="text-xs text-slate-400 font-medium opacity-70">Shadow Twin</span>
            </div>
          )}
          {showInflation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-xs text-orange-400 font-medium">Inflation-Adj.</span>
            </div>
          )}
          {simulatedInvestment && (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: simulatedInvestment.color, boxShadow: `0 0 8px ${simulatedInvestment.color}` }}
              />
              <span className="text-xs font-medium" style={{ color: simulatedInvestment.color }}>
                {simulatedInvestment.ticker} ({simulatedInvestment.annualReturn}%)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-overlay" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickMargin={10} tickFormatter={(v) => `Yr ${v}`} />
            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${symbol}${yAxisTick(v, currency)}`} width={65} />
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: "#334155", strokeWidth: 1, strokeDasharray: "4 4" }} />

            {/* Shadow Twin — dashed semi-transparent gray, render first (behind) */}
            {hasShadow && (
              <Line
                type="monotone"
                dataKey="shadowNetWorth"
                name="Shadow Twin"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="6 4"
                strokeOpacity={0.45}
                dot={false}
                activeDot={{ r: 5, fill: "#94a3b8", stroke: "#fff", fillOpacity: 0.7 }}
              />
            )}

            <Line type={showVolatility ? "linear" : "monotone"} dataKey="netWorth" name="Current Path" stroke="#64748b" strokeWidth={3}
              dot={{ r: 4, fill: "#1e293b", stroke: "#64748b", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#64748b", stroke: "#fff" }} />
            <Line type={showVolatility ? "linear" : "monotone"} dataKey="optimizedNetWorth" name="Optimized Twin" stroke="#34d399" strokeWidth={4}
              filter="url(#glow)" dot={{ r: 4, fill: "#064e3b", stroke: "#34d399", strokeWidth: 2 }} activeDot={{ r: 8, fill: "#34d399", stroke: "#fff" }} />

            {showInflation && (
              <Line type="monotone" dataKey="inflationAdjustedNetWorth" name="Inflation-Adj. (6%)" stroke="#f97316" strokeWidth={2}
                strokeDasharray="5 4" dot={false} activeDot={{ r: 5, fill: "#f97316", stroke: "#fff" }} />
            )}
            {simulatedInvestment && (
              <Line type="monotone" dataKey="overlayNetWorth"
                name={`${simulatedInvestment.ticker} (${simulatedInvestment.annualReturn}%)`}
                stroke={simulatedInvestment.color} strokeWidth={3} strokeDasharray="6 3"
                filter="url(#glow-overlay)" dot={false} activeDot={{ r: 6, fill: simulatedInvestment.color, stroke: "#fff" }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
