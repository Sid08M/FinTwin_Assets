import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { CloudLightning, Cloud, Sun } from "lucide-react";

interface WeatherWrapperProps {
  savingsRate: number;
  children: ReactNode;
}

export function WeatherWrapper({ savingsRate, children }: WeatherWrapperProps) {
  const getTheme = () => {
    if (savingsRate < 10) return "storm";
    if (savingsRate <= 20) return "cloudy";
    return "vibrant";
  };

  const theme = getTheme();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <AnimatePresence mode="wait">
        {theme === "storm" && (
          <motion.div
            key="storm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
            <motion.div 
              animate={{ 
                opacity: [0, 0, 1, 0, 0, 0.8, 0],
                backgroundColor: ["#000", "#000", "#4c1d95", "#000", "#000", "#6d28d9", "#000"]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 mix-blend-screen opacity-10"
            />
          </motion.div>
        )}

        {theme === "cloudy" && (
          <motion.div
            key="cloudy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"
          />
        )}

        {theme === "vibrant" && (
          <motion.div
            key="vibrant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-950 to-black"></div>
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-40 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium font-display shadow-lg border border-white/5">
        {theme === "storm" && <><CloudLightning className="w-4 h-4 text-destructive" /> <span className="text-slate-300">Financial Weather: <span className="text-destructive font-bold">Stormy</span></span></>}
        {theme === "cloudy" && <><Cloud className="w-4 h-4 text-slate-400" /> <span className="text-slate-300">Financial Weather: <span className="text-slate-200 font-bold">Cloudy</span></span></>}
        {theme === "vibrant" && <><Sun className="w-4 h-4 text-emerald-400" /> <span className="text-slate-300">Financial Weather: <span className="text-emerald-400 font-bold">Clear Skies</span></span></>}
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
