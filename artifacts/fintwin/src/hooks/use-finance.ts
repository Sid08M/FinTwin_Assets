import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { runSimulation } from "@workspace/api-client-react";
import { CurrencyCode } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export interface FinancialData {
  monthlyIncome: number;
  monthlyExpensesNeeds: number;
  monthlyExpensesWants: number;
  monthlySavings: number;
  annualReturn: number;
  currentSavings: number;
  years: number;
}

const DEFAULT_DATA: FinancialData = {
  monthlyIncome: 8000,
  monthlyExpensesNeeds: 4000,
  monthlyExpensesWants: 2000,
  monthlySavings: 1500,
  annualReturn: 7.5,
  currentSavings: 25000,
  years: 10,
};

function loadFromStorage() {
  try {
    const raw = window.localStorage.getItem("fintwin_data");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function useFinanceData() {
  const stored = loadFromStorage();

  const [data, setData] = useState<FinancialData>(() => {
    const s = loadFromStorage();
    const { currency: _omit, ...rest } = s ?? {};
    return Object.keys(rest).length ? (rest as FinancialData) : DEFAULT_DATA;
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const s = loadFromStorage();
    return (s?.currency as CurrencyCode) ?? "USD";
  });

  const [isSaved, setIsSaved] = useState(false);

  const debouncedData = useDebounce(data, 500);

  // Auto-save financial data + currency to localStorage on change
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "fintwin_data",
        JSON.stringify({ ...debouncedData, currency })
      );
    } catch (e) {
      console.error("Failed to auto-save data", e);
    }
  }, [debouncedData, currency]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
  }, []);

  const saveData = useCallback(() => {
    try {
      window.localStorage.setItem(
        "fintwin_data",
        JSON.stringify({ ...data, currency })
      );
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save data", e);
    }
  }, [data, currency]);

  const updateField = <K extends keyof FinancialData>(field: K, value: number) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const { data: simulation, isLoading, isError } = useQuery({
    queryKey: ["simulation", debouncedData],
    queryFn: async () => {
      const totalExpenses = debouncedData.monthlyExpensesNeeds + debouncedData.monthlyExpensesWants;
      const result = await runSimulation({
        monthlyIncome: debouncedData.monthlyIncome,
        monthlyExpenses: totalExpenses,
        monthlySavings: debouncedData.monthlySavings,
        annualReturn: debouncedData.annualReturn,
        currentSavings: debouncedData.currentSavings,
        years: debouncedData.years,
      });
      return result;
    },
    placeholderData: (prev) => prev,
  });

  return {
    data,
    currency,
    setCurrency,
    updateField,
    saveData,
    isSaved,
    simulation,
    isLoading,
    isError,
  };
}
