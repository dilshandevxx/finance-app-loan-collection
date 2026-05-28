"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Delete, ShieldCheck, Lock, UserCircle2 } from "lucide-react";
import { loginWithPin } from "@/app/auth-actions";
import { config } from "@/lib/config";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Mobile Haptic Feedback
  const triggerHaptic = (type: "light" | "error" | "success") => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      if (type === "light") {
        navigator.vibrate(25);
      } else if (type === "error") {
        navigator.vibrate([50, 50, 50]);
      } else if (type === "success") {
        navigator.vibrate([40, 30, 40]);
      }
    }
  };

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      triggerHaptic("light");
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    triggerHaptic("light");
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      handleLogin();
    }
  }, [pin]);

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      // Simulate slight network delay for premium feel
      await new Promise(r => setTimeout(r, 600));
      
      const result = await loginWithPin(pin);
      if (result.success) {
        triggerHaptic("success");
        router.push("/");
      } else {
        triggerHaptic("error");
        setError(true);
        setPin("");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      triggerHaptic("error");
      setError(true);
      setPin("");
      setLoading(false);
    }
  };

  const keypadLetters: Record<number, string> = {
    1: " ",
    2: "A B C",
    3: "D E F",
    4: "G H I",
    5: "J K L",
    6: "M N O",
    7: "P Q R S",
    8: "T U V",
    9: "W X Y Z",
    0: "+",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 overflow-hidden relative selection:bg-none">
      
      {/* Premium Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[90vw] h-[90vw] rounded-full bg-blue-500/10 blur-[180px] pointer-events-none animate-pulse duration-[10000ms]" />

      <div className="w-full max-w-sm flex flex-col items-center z-10">
        
        {/* Profile Card Section */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative group mb-4">
            {/* Glowing border ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
            <div className="relative w-20 h-20 rounded-full bg-neutral-900 border-2 border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(config.agentName)}`} 
                alt="Agent Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online Green Badge */}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-4 border-black rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            Hi, {config.agentName}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-medium tracking-wide uppercase">
            LoanTrack Pro Agent
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex flex-col items-center mb-10 w-full">
          <div className={`flex gap-5 mb-3 items-center justify-center h-6 ${error ? "animate-shake" : ""}`}>
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div 
                  key={index} 
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    isFilled 
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 scale-110 shadow-[0_0_12px_rgba(52,211,153,0.7)]" 
                      : error 
                        ? "bg-red-500 scale-100 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        : "bg-neutral-800 border border-neutral-700"
                  }`}
                />
              );
            })}
          </div>
          <div className="h-4">
            {error && (
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
                Incorrect PIN. Try Again
              </span>
            )}
          </div>
        </div>

        {/* Numpad Container (Glassmorphic look) */}
        <div className="w-full max-w-[280px] p-2 rounded-3xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-3 gap-y-4 gap-x-5 justify-items-center p-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={loading}
                className="w-16 h-16 rounded-full bg-white/[0.03] hover:bg-white/[0.08] active:bg-emerald-500/10 border border-white/[0.06] text-xl font-bold text-white shadow-sm active:scale-95 transition-all duration-100 flex flex-col items-center justify-center relative select-none"
              >
                <span>{num}</span>
                <span className="text-[8px] font-bold text-neutral-500 tracking-wider absolute bottom-2.5 uppercase">
                  {keypadLetters[num]}
                </span>
              </button>
            ))}
            
            {/* Blank placeholder */}
            <div className="w-16 h-16"></div>
            
            <button
              onClick={() => handleNumberClick(0)}
              disabled={loading}
              className="w-16 h-16 rounded-full bg-white/[0.03] hover:bg-white/[0.08] active:bg-emerald-500/10 border border-white/[0.06] text-xl font-bold text-white shadow-sm active:scale-95 transition-all duration-100 flex flex-col items-center justify-center relative select-none"
            >
              <span>0</span>
              <span className="text-[8px] font-bold text-neutral-500 tracking-wider absolute bottom-2.5 uppercase">
                {keypadLetters[0]}
              </span>
            </button>
            
            <button
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="w-16 h-16 rounded-full bg-transparent hover:bg-white/[0.03] active:scale-90 transition-all flex items-center justify-center text-neutral-400 hover:text-white select-none disabled:opacity-30 disabled:pointer-events-none"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Lock Icon */}
        <div className="mt-10 flex items-center gap-2 text-[10px] font-bold text-neutral-500 dark:text-neutral-600 uppercase tracking-widest">
          <Lock className="w-3.5 h-3.5" /> Secure agent interface
        </div>

      </div>

      {/* Full screen loader */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col gap-4 items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Authenticating...</span>
        </div>
      )}
      
      {/* Styles for shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.35s ease-in-out;
        }
      `}</style>

    </div>
  );
}
