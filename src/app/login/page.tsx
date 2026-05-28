"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Delete, Lock } from "lucide-react";
import { loginWithPin } from "@/app/auth-actions";
import { config } from "@/lib/config";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const triggerHaptic = (type: "light" | "error" | "success") => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      if (type === "light") navigator.vibrate(25);
      else if (type === "error") navigator.vibrate([50, 50, 50]);
      else if (type === "success") navigator.vibrate([40, 30, 40]);
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
    if (pin.length === 4) handleLogin();
  }, [pin]);

  const handleLogin = async () => {
    setLoading(true);
    try {
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
    } catch {
      triggerHaptic("error");
      setError(true);
      setPin("");
      setLoading(false);
    }
  };

  const keypadLetters: Record<number, string> = {
    1: " ", 2: "ABC", 3: "DEF",
    4: "GHI", 5: "JKL", 6: "MNO",
    7: "PQRS", 8: "TUV", 9: "WXYZ", 0: "+",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#13102a] px-4 overflow-hidden relative">
      
      {/* Ambient glows using vibe palette */}
      <div className="absolute top-[-15%] left-[-15%] w-[70vw] h-[70vw] rounded-full bg-[#7c6dbf]/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[80vw] h-[80vw] rounded-full bg-[#e05470]/15 blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#6ab4e8]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center z-10">
        
        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            {/* Violet gradient ring */}
            <div className="absolute -inset-[3px] bg-gradient-to-tr from-[#e05470] via-[#7c6dbf] to-[#6ab4e8] rounded-full blur-sm opacity-60" />
            <div className="relative w-20 h-20 rounded-full bg-[#1e1a36] border border-[#2e2a4a] overflow-hidden shadow-xl">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(config.agentName)}`}
                alt="Agent Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online dot */}
            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#9dedc8] border-2 border-[#13102a] rounded-full shadow-md" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">Hi, {config.agentName}</h2>
          <p className="text-xs text-[#9e99c8] mt-1 font-medium tracking-widest uppercase">LoanTrack Pro Agent</p>
        </div>

        {/* PIN dots */}
        <div className="flex flex-col items-center mb-10">
          <div className={`flex gap-5 mb-3 items-center justify-center h-6 ${error ? "animate-shake" : ""}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  pin.length > i
                    ? "bg-[#7c6dbf] scale-110 shadow-[0_0_12px_rgba(124,109,191,0.8)]"
                    : error
                    ? "bg-[#e05470] shadow-[0_0_8px_rgba(224,84,112,0.5)]"
                    : "bg-[#2a2548] border border-[#3a3560]"
                }`}
              />
            ))}
          </div>
          {error && (
            <span className="text-[11px] font-bold text-[#e05470] uppercase tracking-widest animate-pulse">
              Incorrect PIN — Try again
            </span>
          )}
        </div>

        {/* Numpad */}
        <div className="w-full max-w-[280px] p-2 rounded-3xl bg-[#1e1a36]/60 border border-[#2e2a4a] backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-3 gap-y-4 gap-x-5 justify-items-center p-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={loading}
                className="w-16 h-16 rounded-full bg-[#2a2548]/80 hover:bg-[#7c6dbf]/20 active:bg-[#7c6dbf]/30 border border-[#3a3560] text-lg font-bold text-white shadow-sm active:scale-95 transition-all duration-100 flex flex-col items-center justify-center relative select-none"
              >
                <span>{num}</span>
                <span className="text-[8px] font-bold text-[#9e99c8] tracking-wider absolute bottom-2.5 uppercase">
                  {keypadLetters[num]}
                </span>
              </button>
            ))}

            <div className="w-16 h-16" />

            <button
              onClick={() => handleNumberClick(0)}
              disabled={loading}
              className="w-16 h-16 rounded-full bg-[#2a2548]/80 hover:bg-[#7c6dbf]/20 active:bg-[#7c6dbf]/30 border border-[#3a3560] text-lg font-bold text-white shadow-sm active:scale-95 transition-all duration-100 flex flex-col items-center justify-center relative select-none"
            >
              <span>0</span>
              <span className="text-[8px] font-bold text-[#9e99c8] tracking-wider absolute bottom-2.5 uppercase">
                {keypadLetters[0]}
              </span>
            </button>

            <button
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="w-16 h-16 rounded-full bg-transparent hover:bg-[#2a2548] active:scale-90 transition-all flex items-center justify-center text-[#9e99c8] hover:text-white select-none disabled:opacity-30 disabled:pointer-events-none"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center gap-2 text-[10px] font-bold text-[#3a3560] uppercase tracking-widest">
          <Lock className="w-3.5 h-3.5" /> Secure Agent Interface
        </div>
      </div>

      {/* Full-screen loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col gap-4 items-center justify-center bg-[#13102a]/90 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full border-4 border-[#7c6dbf]/20 border-t-[#7c6dbf] animate-spin" />
          <span className="text-xs font-bold text-[#9e99c8] uppercase tracking-widest">Authenticating…</span>
        </div>
      )}

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.35s ease-in-out; }
      `}</style>
    </div>
  );
}
