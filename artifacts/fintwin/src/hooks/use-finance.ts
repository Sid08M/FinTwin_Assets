import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { runSimulation } from "@workspace/api-client-react";
import { CurrencyCode } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL ?? "/";

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
  annualIncrement: number;
  currentSavings: number;
  years: number;
}

const DEFAULT_DATA: FinancialData = {
  monthlyIncome: 8000,
  monthlyExpensesNeeds: 4000,
  monthlyExpensesWants: 2000,
  monthlySavings: 1500,
  annualReturn: 7.5,
  annualIncrement: 5,
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

async function apiSave(data: FinancialData, currency: CurrencyCode): Promise<void> {
  const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  await fetch(`${base}/api/user/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "default", ...data, currency }),
  });
}

async function apiLoad(): Promise<{ found: boolean; data?: any }> {
  const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const res = await fetch(`${base}/api/user/load?userId=default`);
  return res.json();
}

export function useFinanceData() {
  const stored = loadFromStorage();

  const [data, setData] = useState<FinancialData>(() => {
    const s = loadFromStorage();
    if (!s) return DEFAULT_DATA;
    const { currency: _c, ...rest } = s;
    return { ...DEFAULT_DATA, ...rest };
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const s = loadFromStorage();
    return (s?.currency as CurrencyCode) ?? "USD";
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // On mount: load from DB and override localStorage/defaults if found
  useEffect(() => {
    apiLoad().then((result) => {
      if (result.found && result.data) {
        const d = result.data;
        setData({
          monthlyIncome: d.monthlyIncome ?? DEFAULT_DATA.monthlyIncome,
          monthlyExpensesNeeds: d.monthlyExpensesNeeds ?? DEFAULT_DATA.monthlyExpensesNeeds,
          monthlyExpensesWants: d.monthlyExpensesWants ?? DEFAULT_DATA.monthlyExpensesWants,
          monthlySavings: d.monthlySavings ?? DEFAULT_DATA.monthlySavings,
          annualReturn: d.annualReturn ?? DEFAULT_DATA.annualReturn,
          annualIncrement: d.annualIncrement ?? DEFAULT_DATA.annualIncrement,
          currentSavings: d.currentSavings ?? DEFAULT_DATA.currentSavings,
          years: d.years ?? DEFAULT_DATA.years,
        });
        if (d.currency) setCurrencyState(d.currency as CurrencyCode);
      }
      setIsDbLoaded(true);
    }).catch(() => setIsDbLoaded(true));
  }, []);

  const debouncedData = useDebounce(data, 500);

  // Auto-save to localStorage on debounced change
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

  const saveData = useCallback(async () => {
    try {
      window.localStorage.setItem(
        "fintwin_data",
        JSON.stringify({ ...data, currency })
      );
      await apiSave(data, currency);
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
        annualIncrement: debouncedData.annualIncrement,
        currentSavings: debouncedData.currentSavings,
        years: debouncedData.years,
      });
      return result;
    },
    enabled: isDbLoaded,
    placeholderData: (prev) => prev,
  });

  return {
    data,
    currency,
    setCurrency,
    updateField,
    saveData,
    isSaved,
    isDbLoaded,
    simulation,
    isLoading,
    isError,
  };
}
