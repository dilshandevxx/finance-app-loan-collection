"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Delete, Lock } from "lucide-react";
import { loginWithPin, setupAgentPin } from "@/app/auth-actions";
import { config } from "@/lib/config";

export default function PinClient({ isSetup, agentName }: { isSetup: boolean, agentName: string }) {
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

  const handleAction = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));

      const result = isSetup
        ? await loginWithPin(pin)
        : await setupAgentPin(pin);

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
  }, [pin, isSetup, router]);

  useEffect(() => {
    if (pin.length === 4) {
      const handle = requestAnimationFrame(() => {
        handleAction();
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [pin, handleAction]);

  const keypadLetters: Record<number, string> = {
    1: " ", 2: "ABC", 3: "DEF",
    4: "GHI", 5: "JKL", 6: "MNO",
    7: "PQRS", 8: "TUV", 9: "WXYZ", 0: "+",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 overflow-hidden relative">

      <div className="w-full max-w-sm flex flex-col items-center z-10">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            {/* Primary ring */}
            <div className="absolute -inset-[3px] bg-primary/20 rounded-full blur-xs opacity-60" />
            <div className="relative w-20 h-20 rounded-full bg-card border border-border overflow-hidden shadow-xl">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agentName)}`}
                alt="Agent Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online dot */}
            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-primary border-2 border-background rounded-full shadow-md" />
          </div>

          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {isSetup ? `Hi, ${agentName}` : "Create your PIN"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium tracking-widest uppercase">
            {isSetup ? "LoanTrack Pro Agent" : "Set up a 4-digit PIN for quick access"}
          </p>
        </div>

        {/* PIN dots */}
        <div className="flex flex-col items-center mb-10">
          <div className={`flex gap-5 mb-3 items-center justify-center h-6 ${error ? "animate-shake" : ""}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${pin.length > i
                    ? "bg-primary scale-110 shadow-[0_0_12px_var(--primary)]"
                    : error
                      ? "bg-destructive-foreground shadow-[0_0_8px_var(--destructive-foreground)]"
                      : "bg-secondary border border-border"
                  }`}
              />
            ))}
          </div>
          {error && (
            <span className="text-[11px] font-bold text-destructive-foreground uppercase tracking-widest animate-pulse">
              {isSetup ? "Incorrect PIN — Try again" : "Error creating PIN"}
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="w-full max-w-[280px] p-2 rounded-3xl bg-card border border-border backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-3 gap-y-4 gap-x-5 justify-items-center p-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={loading}
                className="w-16 h-16 rounded-full bg-secondary/80 hover:bg-primary/10 active:bg-primary/20 border border-border text-lg font-bold text-foreground shadow-sm active:scale-95 transition-all duration-100 flex flex-col items-center justify-center relative select-none cursor-pointer"
              >
                <span>{num}</span>
                <span className="text-[8px] font-bold text-muted-foreground tracking-wider absolute bottom-2.5 uppercase">
                  {keypadLetters[num]}
                </span>
              </button>
            ))}

            <div className="w-16 h-16" />

            <button
              onClick={() => handleNumberClick(0)}
              disabled={loading}
              className="w-16 h-16 rounded-full bg-secondary/80 hover:bg-primary/10 active:bg-primary/20 border border-border text-lg font-bold text-foreground shadow-sm active:scale-95 transition-all duration-100 flex flex-col items-center justify-center relative select-none cursor-pointer"
            >
              <span>0</span>
              <span className="text-[8px] font-bold text-muted-foreground tracking-wider absolute bottom-2.5 uppercase">
                {keypadLetters[0]}
              </span>
            </button>

            <button
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="w-16 h-16 rounded-full bg-transparent hover:bg-secondary active:scale-90 transition-all flex items-center justify-center text-muted-foreground hover:text-foreground select-none disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          <Lock className="w-3.5 h-3.5" /> Secure Agent Interface
        </div>
      </div>

      {/* Full-screen loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col gap-4 items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Authenticating…</span>
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
