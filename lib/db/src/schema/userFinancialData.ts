import { pgTable, text, doublePrecision, integer, timestamp } from "drizzle-orm/pg-core";

export const userFinancialData = pgTable("user_financial_data", {
  userId: text("user_id").primaryKey(),
  monthlyIncome: doublePrecision("monthly_income").notNull().default(8000),
  monthlyExpensesNeeds: doublePrecision("monthly_expenses_needs").notNull().default(4000),
  monthlyExpensesWants: doublePrecision("monthly_expenses_wants").notNull().default(2000),
  monthlySavings: doublePrecision("monthly_savings").notNull().default(1500),
  annualReturn: doublePrecision("annual_return").notNull().default(7.5),
  annualIncrement: doublePrecision("annual_increment").notNull().default(5),
  currentSavings: doublePrecision("current_savings").notNull().default(25000),
  years: integer("years").notNull().default(10),
  currency: text("currency").notNull().default("USD"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UserFinancialData = typeof userFinancialData.$inferSelect;
