import { useState } from "react";
import { useGetAiAdvice } from "@workspace/api-client-react";
import type { FinancialData } from "./use-finance";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

interface UseAiChatOptions {
  financialData: FinancialData;
  baselineSavingsRate?: number | null;
  currentSavingsRate?: number | null;
}

export function useAiChat({ financialData, baselineSavingsRate, currentSavingsRate }: UseAiChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<"professional" | "roast">("professional");

  const adviceMutation = useGetAiAdvice();

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: question }]);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
      // Build the financialStats object, injecting baseline vs current for Smart Memory
      const financialStats: Record<string, unknown> = {
        ...financialData,
        expenseRatio: (financialData.monthlyExpensesNeeds + financialData.monthlyExpensesWants) / financialData.monthlyIncome,
        savingsRate: financialData.monthlySavings / financialData.monthlyIncome,
      };

      if (baselineSavingsRate !== null && baselineSavingsRate !== undefined) {
        financialStats["User Baseline Savings Rate"] = `${baselineSavingsRate}%`;
      }
      if (currentSavingsRate !== null && currentSavingsRate !== undefined) {
        financialStats["Current Savings Rate"] = `${currentSavingsRate}%`;
      }

      const response = await adviceMutation.mutateAsync({
        data: { financialStats, question, mode }
      });

      const fullText = response.advice;
      let currentText = "";

      const typeChar = (index: number) => {
        if (index < fullText.length) {
          currentText += fullText.charAt(index);
          setMessages((prev) =>
            prev.map(m => m.id === assistantMsgId ? { ...m, content: currentText } : m)
          );
          setTimeout(() => typeChar(index + 1), 10);
        } else {
          setMessages((prev) =>
            prev.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false } : m)
          );
        }
      };

      typeChar(0);
    } catch (error) {
      console.error("AI Advice Error:", error);
      setMessages((prev) =>
        prev.map(m => m.id === assistantMsgId ? {
          ...m,
          content: "I'm having trouble analyzing your data right now. Please try again.",
          isStreaming: false,
        } : m)
      );
    }
  };

  return { messages, sendMessage, mode, setMode, isGenerating: adviceMutation.isPending };
}
