import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { runSimulation } from "@workspace/api-client-react";

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

export function useFinanceData() {
  // Load initial from local storage or use default
  const [data, setData] = useState<FinancialData>(() => {
    try {
      const item = window.localStorage.getItem("fintwin_data");
      if (item) return JSON.parse(item);
    } catch (e) {
      console.warn("Failed to load local data", e);
    }
    return DEFAULT_DATA;
  });

  const [isSaved, setIsSaved] = useState(false);

  // Debounce data for the API call to prevent spamming
  const debouncedData = useDebounce(data, 500);

  const saveData = useCallback(() => {
    try {
      window.localStorage.setItem("fintwin_data", JSON.stringify(data));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save data", e);
    }
  }, [data]);

  const updateField = <K extends keyof FinancialData>(field: K, value: number) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // Run simulation query
  const { data: simulation, isLoading, isError } = useQuery({
    queryKey: ["simulation", debouncedData],
    queryFn: async () => {
      // API expects total expenses
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
    // Keep previous data while fetching to avoid jarring UI flickers
    placeholderData: (prev) => prev,
  });

  return {
    data,
    updateField,
    saveData,
    isSaved,
    simulation,
    isLoading,
    isError,
  };
}
