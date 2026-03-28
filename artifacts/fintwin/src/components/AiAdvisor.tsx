import { useState, useRef, useEffect } from "react";
import { FinancialData } from "@/hooks/use-finance";
import { useAiChat } from "@/hooks/use-ai-chat";
import { MessageSquare, X, Send, Bot, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "./ui/switch";

interface AiAdvisorProps {
  data: FinancialData;
  baselineSavingsRate?: number | null;
  currentSavingsRate?: number | null;
}

export function AiAdvisor({ data, baselineSavingsRate, currentSavingsRate }: AiAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, mode, setMode, isGenerating } = useAiChat({
    financialData: data,
    baselineSavingsRate,
    currentSavingsRate,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    sendMessage(input);
    setInput("");
  };

  const hasSavingsComparison = baselineSavingsRate !== null && baselineSavingsRate !== undefined
    && currentSavingsRate !== null && currentSavingsRate !== undefined;
  const savingsDelta = hasSavingsComparison ? (currentSavingsRate! - baselineSavingsRate!) : 0;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-110 transition-all z-50"
          >
            <MessageSquare className="w-6 h-6" />
            {hasSavingsComparison && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 text-[9px] font-bold flex items-center justify-center ${savingsDelta >= 0 ? "bg-emerald-400" : "bg-red-400"}`}>
                {savingsDelta >= 0 ? "↑" : "↓"}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-full max-w-[380px] h-[600px] max-h-[80vh] glass-panel rounded-2xl flex flex-col z-50 overflow-hidden border-t border-white/20 shadow-2xl"
          >
            {/* Header */}
            <div className={`p-4 border-b border-white/10 flex items-center justify-between transition-colors ${mode === 'roast' ? 'bg-destructive/10' : 'bg-slate-900/50'}`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    {mode === 'roast' ? <Flame className="w-5 h-5 text-orange-400" /> : <Bot className="w-5 h-5 text-emerald-400" />}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white leading-tight">FinTwin Advisor</h3>
                  <p className="text-xs text-slate-400">
                    {mode === 'professional' ? 'Strategic Analysis' : 'Brutal Honesty'}
                    {hasSavingsComparison && (
                      <span className={`ml-2 font-semibold ${savingsDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        · Smart Memory {savingsDelta >= 0 ? "↑" : "↓"}{Math.abs(savingsDelta).toFixed(1)}%
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Memory Banner */}
            {hasSavingsComparison && (
              <div className={`px-4 py-2 text-xs border-b border-white/5 ${savingsDelta >= 0 ? "bg-emerald-500/8 text-emerald-300" : "bg-red-500/8 text-red-300"}`}>
                {savingsDelta >= 0
                  ? `📈 Since your first visit, savings rate improved ${baselineSavingsRate}% → ${currentSavingsRate}%`
                  : `📉 Savings rate dropped from ${baselineSavingsRate}% to ${currentSavingsRate}% — ask me about it`
                }
              </div>
            )}

            {/* Mode Toggle */}
            <div className="px-4 py-2 bg-black/20 flex items-center justify-between border-b border-white/5">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                {mode === 'roast' ? <Flame className="w-3 h-3 text-orange-500" /> : <Bot className="w-3 h-3 text-cyan-500" />}
                {mode === 'roast' ? 'Roast Mode Active' : 'Professional Mode'}
              </span>
              <Switch
                checked={mode === 'roast'}
                onCheckedChange={(c) => setMode(c ? 'roast' : 'professional')}
                className={mode === 'roast' ? 'bg-orange-500' : 'bg-cyan-600'}
              />
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
                  <Bot className="w-12 h-12 text-slate-400 mb-3" />
                  <p className="text-slate-300 font-medium">Ask me about your financial twin.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {hasSavingsComparison
                      ? `"How does my ${savingsDelta >= 0 ? "improvement" : "drop"} affect my 10-year wealth?"`
                      : '"How can I reach $1M faster?"'
                    }
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : `bg-slate-800 text-slate-200 rounded-bl-none border border-white/5 ${mode === 'roast' ? 'border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]' : ''}`
                  }`}>
                    {msg.isStreaming && !msg.content ? (
                      <span className="flex gap-1">
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>.</motion.span>
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                      </span>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-slate-900/80 border-t border-white/10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={hasSavingsComparison ? "Ask about your baseline vs now..." : "Ask your digital twin..."}
                  className="w-full bg-black/50 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isGenerating}
                  className="absolute right-2 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
                >
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
