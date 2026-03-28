import { useState } from "react";
import { useFinanceData } from "@/hooks/use-finance";
import { WeatherWrapper } from "@/components/WeatherWrapper";
import { InputForm } from "@/components/InputForm";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { TwinChart } from "@/components/TwinChart";
import { BudgetGauge } from "@/components/BudgetGauge";
import { LeakWarnings } from "@/components/LeakWarnings";
import { AiAdvisor } from "@/components/AiAdvisor";
import { InvestmentSuggestions } from "@/components/InvestmentSuggestions";
import { Save, RefreshCw, Zap, TrendingDown, MessageSquare } from "lucide-react";
import { CurrencyCode } from "@/lib/utils";
import { Investment, getRecommendations } from "@/lib/investments";
import { motion } from "framer-motion";

const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
  { code: "JPY", label: "¥ JPY" },
  { code: "CAD", label: "$ CAD" },
  { code: "AUD", label: "$ AUD" },
  { code: "INR", label: "₹ INR" },
];

export function Dashboard() {
  const { data, currency, setCurrency, updateField, saveData, isSaved, simulation, isLoading } =
    useFinanceData();

  const [simulatedInvestment, setSimulatedInvestment] = useState<Investment | null>(null);
  const [showVolatility, setShowVolatility] = useState(false);
  const [showInflation, setShowInflation] = useState(false);

  const savingsRate = data.monthlyIncome > 0
    ? (data.monthlySavings / data.monthlyIncome) * 100
    : 0;

  const recommendationResult = getRecommendations(data);

  return (
    <WeatherWrapper savingsRate={savingsRate}>
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-10 mb-4">
          <div>
            <h1 className="text-4xl font-display font-extrabold text-white flex items-center gap-3">
              FinTwin <SparkleIcon className="text-emerald-400 w-8 h-8" />
            </h1>
            <p className="text-slate-400 mt-1">Your Personal Financial Reality Engine</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="appearance-none bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white font-medium text-sm px-4 py-2.5 pr-8 rounded-xl cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button
              onClick={saveData}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                isSaved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/30"
              }`}
            >
              {isSaved ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaved ? "Saved to Timeline" : "Save Reality"}
            </button>
          </div>
        </header>

        {/* Hero Paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-panel rounded-2xl px-6 py-5 border-l-4 border-emerald-500/60"
        >
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            <span className="text-white font-semibold">FinTwin: Your Personal Financial Reality Engine.</span>{" "}
            We bridge the gap between today's habits and tomorrow's wealth. Visualize your 10-year digital twin
            and optimize your trajectory with AI-driven insights — powered by real compounding math, inflation
            modelling, and a live investment recommendation engine.
          </p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Inputs + Budget Gauge */}
          <div className="lg:col-span-4 space-y-6">
            <InputForm data={data} updateField={updateField} />
            <BudgetGauge data={data} />
          </div>

          {/* Right Column: Metrics + Chart Controls + Chart + Warnings */}
          <div className="lg:col-span-8 space-y-6">
            <DashboardMetrics simulation={simulation} isLoading={isLoading} currency={currency} />

            {/* Chart Controls */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowVolatility((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  showVolatility
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <Zap className="w-4 h-4" />
                Market Volatility {showVolatility ? "ON" : "OFF"}
              </button>
              <button
                onClick={() => setShowInflation((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  showInflation
                    ? "bg-orange-500/15 text-orange-400 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                6% Inflation View {showInflation ? "ON" : "OFF"}
              </button>
            </div>

            <TwinChart
              simulation={simulation}
              currency={currency}
              financialData={data}
              simulatedInvestment={simulatedInvestment}
              showVolatility={showVolatility}
              showInflation={showInflation}
            />
            <LeakWarnings data={data} currency={currency} />
          </div>
        </div>

        {/* Investment Suggestions */}
        <InvestmentSuggestions
          data={data}
          result={recommendationResult}
          currency={currency}
          activeInvestment={simulatedInvestment}
          onSimulate={setSimulatedInvestment}
        />

        {/* AI Advisor Scroll-Reveal Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="glass-panel rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.06)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <MessageSquare className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-display font-bold text-white mb-1">Your AI Financial Advisor is Ready</h3>
            <p className="text-slate-400 text-sm">
              Ask anything — "How do I hit $1M in 10 years?", "Roast my budget", or "What's my best next move?".
              The advisor reads your live data and the database to craft a personalized 10-year wealth strategy.
            </p>
          </div>
          <div className="text-xs text-slate-500 shrink-0 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Tap the chat button →
          </div>
        </motion.div>

        <div className="pb-24" />
      </div>

      <AiAdvisor data={data} />
    </WeatherWrapper>
  );
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
