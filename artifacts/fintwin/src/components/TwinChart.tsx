import { SimulationResult } from "@workspace/api-client-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface TwinChartProps {
  simulation?: SimulationResult;
}

export function TwinChart({ simulation }: TwinChartProps) {
  if (!simulation || !simulation.yearlyData) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-[400px] flex items-center justify-center">
        <p className="text-slate-500 animate-pulse font-display">Simulating realities...</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl">
          <p className="text-slate-400 font-medium mb-2">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 text-sm">{entry.name}:</span>
              <span className="text-white font-bold font-display">{formatCurrency(entry.value)}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-800">
            <p className="text-xs text-emerald-400 font-medium">
              Twin Advantage: +{formatCurrency(payload[1].value - payload[0].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-display font-bold text-white">Twin Trajectories</h3>
          <p className="text-slate-400 text-sm">You vs. You saving 10% more efficiently.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-xs text-slate-400">Current Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-xs text-emerald-400 font-medium">Optimized Twin</span>
          </div>
        </div>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={simulation.yearlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="year" 
              stroke="#64748b" 
              fontSize={12} 
              tickMargin={10} 
              tickFormatter={(val) => `Yr ${val}`}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Line 
              type="monotone" 
              dataKey="netWorth" 
              name="Current Path" 
              stroke="#64748b" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#1e293b', stroke: '#64748b', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#64748b', stroke: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey="optimizedNetWorth" 
              name="Optimized Twin" 
              stroke="#34d399" 
              strokeWidth={4}
              filter="url(#glow)"
              dot={{ r: 4, fill: '#064e3b', stroke: '#34d399', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#34d399', stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
