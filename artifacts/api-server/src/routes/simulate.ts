import { Router, type IRouter } from "express";
import { RunSimulationBody, GetAiAdviceBody } from "@workspace/api-zod";
import { ai } from "@workspace/integrations-gemini-ai";

const router: IRouter = Router();

function futureValueAnnuity(
  monthlyContribution: number,
  annualRate: number,
  years: number,
  presentValue: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;

  if (monthlyRate === 0) {
    return presentValue + monthlyContribution * n;
  }

  const fvAnnuity = monthlyContribution * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);
  const fvLump = presentValue * Math.pow(1 + monthlyRate, n);
  return fvAnnuity + fvLump;
}

router.post("/simulate", (req, res) => {
  const parsed = RunSimulationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }

  const { monthlyIncome, monthlyExpenses, monthlySavings, annualReturn, currentSavings, years } = parsed.data;

  const monthlyCashFlow = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  const yearlyData = [];
  for (let y = 1; y <= years; y++) {
    const netWorth = futureValueAnnuity(monthlySavings, annualReturn, y, currentSavings);
    const optimizedMonthlySavings = monthlySavings + monthlyIncome * 0.1;
    const optimizedNetWorth = futureValueAnnuity(optimizedMonthlySavings, annualReturn, y, currentSavings);
    yearlyData.push({ year: y, netWorth: Math.round(netWorth), optimizedNetWorth: Math.round(optimizedNetWorth) });
  }

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

router.post("/ai/advise", async (req, res) => {
  const parsed = GetAiAdviceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }

  const { financialStats, question, mode } = parsed.data;

  const statsText = Object.entries(financialStats)
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
