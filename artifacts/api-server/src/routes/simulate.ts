import { Router, type IRouter } from "express";
import { RunSimulationBody, GetAiAdviceBody } from "@workspace/api-zod";
import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import { userFinancialData } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const INFLATION_RATE = 6; // 6% annual inflation

function simulateYearByYear(
  currentSavings: number,
  monthlySavings: number,
  annualReturn: number,
  annualIncrement: number,
  years: number
) {
  const monthlyRate = annualReturn / 100 / 12;
  let netWorth = currentSavings;
  let currentMonthlySavings = monthlySavings;
  const yearlyData = [];

  for (let y = 1; y <= years; y++) {
    const n = 12;
    const fvPV = netWorth * Math.pow(1 + monthlyRate, n);
    const fvPMT =
      monthlyRate === 0
        ? currentMonthlySavings * n
        : currentMonthlySavings * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);
    netWorth = fvPV + fvPMT;
    const inflationAdjustedNetWorth = netWorth / Math.pow(1 + INFLATION_RATE / 100, y);
    yearlyData.push({
      year: y,
      netWorth: Math.round(netWorth),
      inflationAdjustedNetWorth: Math.round(inflationAdjustedNetWorth),
    });
    // Grow savings by salary increment for next year
    currentMonthlySavings *= 1 + annualIncrement / 100;
  }
  return yearlyData;
}

router.post("/simulate", (req, res) => {
  const parsed = RunSimulationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }

  const {
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    annualReturn,
    annualIncrement = 0,
    currentSavings,
    years,
  } = parsed.data;

  const monthlyCashFlow = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  const currentData = simulateYearByYear(
    currentSavings,
    monthlySavings,
    annualReturn,
    annualIncrement,
    years
  );

  // Optimized twin saves 10% more of income each month
  const optimizedSavings = monthlySavings + monthlyIncome * 0.1;
  const optimizedData = simulateYearByYear(
    currentSavings,
    optimizedSavings,
    annualReturn,
    annualIncrement,
    years
  );

  const yearlyData = currentData.map((d, i) => ({
    year: d.year,
    netWorth: d.netWorth,
    optimizedNetWorth: optimizedData[i].netWorth,
    inflationAdjustedNetWorth: d.inflationAdjustedNetWorth,
  }));

  const finalNetWorth = yearlyData[yearlyData.length - 1]?.netWorth ?? 0;
  const optimizedFinalNetWorth = yearlyData[yearlyData.length - 1]?.optimizedNetWorth ?? 0;

  res.json({
    finalNetWorth,
    optimizedFinalNetWorth,
    monthlyCashFlow,
    savingsRate: Math.round(savingsRate * 10) / 10,
    yearlyData,
  });
});

router.post("/user/save", async (req, res) => {
  const b = req.body as Record<string, unknown>;
  if (typeof b.monthlyIncome !== "number" || typeof b.monthlySavings !== "number") {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const userId = typeof b.userId === "string" ? b.userId : "default";
  const fields = {
    monthlyIncome: b.monthlyIncome as number,
    monthlyExpensesNeeds: (b.monthlyExpensesNeeds as number) ?? 0,
    monthlyExpensesWants: (b.monthlyExpensesWants as number) ?? 0,
    monthlySavings: b.monthlySavings as number,
    annualReturn: (b.annualReturn as number) ?? 7.5,
    annualIncrement: (b.annualIncrement as number) ?? 0,
    currentSavings: (b.currentSavings as number) ?? 0,
    years: (b.years as number) ?? 10,
    currency: typeof b.currency === "string" ? b.currency : "USD",
  };

  try {
    await db
      .insert(userFinancialData)
      .values({ userId, ...fields })
      .onConflictDoUpdate({
        target: userFinancialData.userId,
        set: { ...fields, updatedAt: new Date() },
      });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error saving user data");
    res.status(500).json({ error: "Failed to save" });
  }
});

router.get("/user/load", async (req, res) => {
  const userId = (req.query.userId as string) || "default";
  try {
    const rows = await db
      .select()
      .from(userFinancialData)
      .where(eq(userFinancialData.userId, userId))
      .limit(1);
    if (rows.length === 0) {
      res.json({ found: false });
      return;
    }
    res.json({ found: true, data: rows[0] });
  } catch (err) {
    req.log.error({ err }, "Error loading user data");
    res.status(500).json({ error: "Failed to load" });
  }
});

router.post("/ai/advise", async (req, res) => {
  const parsed = GetAiAdviceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }

  const { financialStats, question, mode } = parsed.data;

  // Read latest DB data if available and merge with provided stats
  let latestStats = { ...financialStats };
  try {
    const rows = await db
      .select()
      .from(userFinancialData)
      .where(eq(userFinancialData.userId, "default"))
      .limit(1);
    if (rows.length > 0) {
      const d = rows[0];
      latestStats = {
        ...latestStats,
        "Monthly Income (DB)": d.monthlyIncome,
        "Monthly Savings (DB)": d.monthlySavings,
        "Current Savings (DB)": d.currentSavings,
        "Annual Return (DB)": `${d.annualReturn}%`,
        "Annual Salary Increment (DB)": `${d.annualIncrement}%`,
        "Currency": d.currency,
      };
    }
  } catch (_) {
    // non-fatal: proceed with provided stats
  }

  const statsText = Object.entries(latestStats)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  let systemPrompt: string;
  if (mode === "roast") {
    systemPrompt = `You are an aggressively sarcastic financial guru who ruthlessly roasts people's bad money habits. 
Be hilariously harsh, call out their "money leaks", and critique their financial decisions with savage wit. 
Use dramatic language, financial slang, and mock them for their poor choices while still providing actual advice buried in the roast.
Keep responses under 200 words. Be entertaining but ultimately helpful.`;
  } else {
    systemPrompt = `You are a professional, empathetic financial advisor. 
Provide clear, actionable, personalized financial advice based on the user's current stats.
Be encouraging, specific, and concrete. Use real numbers from their data.
Build a 10-year wealth strategy roadmap based on the provided data.
Keep responses under 200 words.`;
  }

  const userMessage = `Here are my financial stats:\n${statsText}\n\nMy question: ${question}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\n" + userMessage }] }
      ],
      config: { maxOutputTokens: 8192 },
    });

    const advice = response.text ?? "Unable to generate advice at this time.";
    res.json({ advice });
  } catch (err) {
    req.log.error({ err }, "Gemini AI error");
    res.status(500).json({ error: "AI service error" });
  }
});

export default router;
