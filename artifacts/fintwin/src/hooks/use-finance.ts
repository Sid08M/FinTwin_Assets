import { useState, useCallback, useEffect, useMemo } from "react";
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

export interface BaselineSnapshot {
  monthlyIncome: number;
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

async function apiLoad(): Promise<{ found: boolean; currentData?: any; baselineData?: any }> {
  const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const res = await fetch(`${base}/api/user/load?userId=default`);
  return res.json();
}

// Year-by-year compound simulation (mirrors backend logic)
export function computeYearlySeries(
  currentSavings: number,
  monthlySavings: number,
  annualReturn: number,
  annualIncrement: number,
  years: number
): { year: number; netWorth: number }[] {
  const monthlyRate = annualReturn / 100 / 12;
  let netWorth = currentSavings;
  let ms = monthlySavings;
  const out = [];
  for (let y = 1; y <= years; y++) {
    const fvPV = netWorth * Math.pow(1 + monthlyRate, 12);
    const fvPMT =
      monthlyRate === 0
        ? ms * 12
        : ms * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate);
    netWorth = fvPV + fvPMT;
    out.push({ year: y, netWorth: Math.round(netWorth) });
    ms *= 1 + annualIncrement / 100;
  }
  return out;
}

export function useFinanceData() {
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
  const [baselineData, setBaselineData] = useState<BaselineSnapshot | null>(null);

  // Load from DB on mount
  useEffect(() => {
    apiLoad().then((result) => {
      if (result.found && result.currentData) {
        const d = result.currentData;
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
      if (result.baselineData) {
        const b = result.baselineData;
        setBaselineData({
          monthlyIncome: b.monthlyIncome,
          monthlySavings: b.monthlySavings,
          annualReturn: b.annualReturn,
          annualIncrement: b.annualIncrement ?? 0,
          currentSavings: b.currentSavings,
          years: b.years,
        });
      }
      setIsDbLoaded(true);
    }).catch(() => setIsDbLoaded(true));
  }, []);

  const debouncedData = useDebounce(data, 500);

  // Auto-save to localStorage on debounced change
  useEffect(() => {
    try {
      window.localStorage.setItem("fintwin_data", JSON.stringify({ ...debouncedData, currency }));
    } catch {}
  }, [debouncedData, currency]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
  }, []);

  const saveData = useCallback(async () => {
    try {
      window.localStorage.setItem("fintwin_data", JSON.stringify({ ...data, currency }));
      await apiSave(data, currency);
      // After save, refresh baseline from DB
      const result = await apiLoad();
      if (result.baselineData) {
        const b = result.baselineData;
        setBaselineData({
          monthlyIncome: b.monthlyIncome,
          monthlySavings: b.monthlySavings,
          annualReturn: b.annualReturn,
          annualIncrement: b.annualIncrement ?? 0,
          currentSavings: b.currentSavings,
          years: b.years,
        });
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save data", e);
    }
  }, [data, currency]);

  const updateField = <K extends keyof FinancialData>(field: K, value: number) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const { data: simulation, isLoading } = useQuery({
    queryKey: ["simulation", debouncedData],
    queryFn: async () => {
      const totalExpenses = debouncedData.monthlyExpensesNeeds + debouncedData.monthlyExpensesWants;
      return runSimulation({
        monthlyIncome: debouncedData.monthlyIncome,
        monthlyExpenses: totalExpenses,
        monthlySavings: debouncedData.monthlySavings,
        annualReturn: debouncedData.annualReturn,
        annualIncrement: debouncedData.annualIncrement,
        currentSavings: debouncedData.currentSavings,
        years: debouncedData.years,
      });
    },
    enabled: isDbLoaded,
    placeholderData: (prev) => prev,
  });

  // Shadow Twin series computed from baseline data
  const shadowSeries = useMemo(() => {
    if (!baselineData || !simulation) return null;
    return computeYearlySeries(
      baselineData.currentSavings,
      baselineData.monthlySavings,
      baselineData.annualReturn,
      baselineData.annualIncrement,
      data.years
    );
  }, [baselineData, simulation, data.years]);

  // Delta: difference in projected net worth between current path vs shadow twin
  const netWorthDelta = useMemo(() => {
    if (!simulation || !shadowSeries) return null;
    const currentFinal = simulation.finalNetWorth;
    const shadowFinal = shadowSeries[shadowSeries.length - 1]?.netWorth ?? 0;
    return currentFinal - shadowFinal;
  }, [simulation, shadowSeries]);

  // Savings rate comparison
  const baselineSavingsRate = baselineData && baselineData.monthlyIncome > 0
    ? Math.round((baselineData.monthlySavings / baselineData.monthlyIncome) * 1000) / 10
    : null;
  const currentSavingsRate = data.monthlyIncome > 0
    ? Math.round((data.monthlySavings / data.monthlyIncome) * 1000) / 10
    : null;

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
    baselineData,
    shadowSeries,
    netWorthDelta,
    baselineSavingsRate,
    currentSavingsRate,
  };
}
