import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-3">Timeline Not Found</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          The financial reality you are trying to access doesn't exist in this universe.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
