import { FinancialData } from "@/hooks/use-finance";
import { DollarSign, Percent, Calendar, Target, Activity, Wallet } from "lucide-react";
import { ElementType } from "react";

interface InputRowProps {
  label: string;
  value: number;
  field: keyof FinancialData;
  icon: ElementType;
  prefix?: string;
  suffix?: string;
  step?: number;
  updateField: <K extends keyof FinancialData>(field: K, value: number) => void;
}

function InputRow({ label, value, field, icon: Icon, prefix, suffix, step = 100, updateField }: InputRowProps) {
  return (
    <div className="group space-y-2">
      <label className="text-sm font-medium text-slate-400 flex items-center gap-2 group-focus-within:text-emerald-400 transition-colors">
        <Icon className="w-4 h-4" /> {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => updateField(field, Number(e.target.value))}
          step={step}
          className={`glass-input w-full ${prefix ? "pl-8" : ""} ${suffix ? "pr-12" : ""} font-display font-medium text-lg`}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

interface InputFormProps {
  data: FinancialData;
  updateField: <K extends keyof FinancialData>(field: K, value: number) => void;
}

export function InputForm({ data, updateField }: InputFormProps) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Parameters</h2>
        <p className="text-slate-400 text-sm">Tune your digital twin's reality engine.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-6 pb-6 border-b border-white/5">
          <h3 className="text-xs uppercase tracking-wider text-emerald-500 font-bold">Income & Savings</h3>
          <InputRow label="Monthly Income" value={data.monthlyIncome} field="monthlyIncome" icon={DollarSign} prefix="$" updateField={updateField} />
          <InputRow label="Monthly Savings" value={data.monthlySavings} field="monthlySavings" icon={Wallet} prefix="$" updateField={updateField} />
        </div>

        <div className="space-y-6 pb-6 border-b border-white/5">
          <h3 className="text-xs uppercase tracking-wider text-cyan-500 font-bold">Expenses</h3>
          <InputRow label="Needs (Rent, Groceries)" value={data.monthlyExpensesNeeds} field="monthlyExpensesNeeds" icon={Activity} prefix="$" updateField={updateField} />
          <InputRow label="Wants (Dining, Hobbies)" value={data.monthlyExpensesWants} field="monthlyExpensesWants" icon={Target} prefix="$" updateField={updateField} />
        </div>

        <div className="space-y-6 pb-6 border-b border-white/5">
          <h3 className="text-xs uppercase tracking-wider text-purple-400 font-bold">Future Horizon</h3>
          <InputRow label="Current Saved Capital" value={data.currentSavings} field="currentSavings" icon={DollarSign} prefix="$" step={1000} updateField={updateField} />
          <InputRow label="Expected Annual Return" value={data.annualReturn} field="annualReturn" icon={Percent} suffix="%" step={0.5} updateField={updateField} />
          <InputRow label="Simulation Years" value={data.years} field="years" icon={Calendar} suffix="yrs" step={1} updateField={updateField} />
        </div>
      </div>
    </div>
  );
}
