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
import { Save, RefreshCw } from "lucide-react";
import { CurrencyCode } from "@/lib/utils";
import { Investment, getRecommendations } from "@/lib/investments";

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
            {/* Currency Selector */}
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
              {isSaved ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaved ? "Saved to Timeline" : "Save Reality"}
            </button>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Inputs + Budget Gauge */}
          <div className="lg:col-span-4 space-y-6">
            <InputForm data={data} updateField={updateField} />
            <BudgetGauge data={data} />
          </div>

          {/* Right Column: Metrics + Chart + Warnings */}
          <div className="lg:col-span-8 space-y-6">
            <DashboardMetrics simulation={simulation} isLoading={isLoading} currency={currency} />
            <TwinChart
              simulation={simulation}
              currency={currency}
              financialData={data}
              simulatedInvestment={simulatedInvestment}
            />
            <LeakWarnings data={data} currency={currency} />
          </div>
        </div>

        {/* Investment Suggestions — full width below everything */}
        <InvestmentSuggestions
          data={data}
          result={recommendationResult}
          currency={currency}
          activeInvestment={simulatedInvestment}
          onSimulate={setSimulatedInvestment}
        />

      </div>

      <AiAdvisor data={data} />
    </WeatherWrapper>
  );
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
