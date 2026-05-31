"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, LogOut, Delete } from "lucide-react";
import { loginWithPin, setupAgentPin, logout } from "@/app/auth-actions";
import { config } from "@/lib/config";

type PinClientProps = {
  needsSetup: boolean;
  agentName: string;
};

export default function PinClient({ needsSetup, agentName }: PinClientProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin]);

  const handlePinSubmit = async (submitPin: string) => {
    setLoading(true);
    setError(null);
    try {
      if (needsSetup) {
        const result = await setupAgentPin(submitPin);
        if (result.success) {
          router.push("/");
        } else {
          setError(result.error || "Failed to setup PIN");
          setPin("");
        }
      } else {
        const result = await loginWithPin(submitPin);
        if (result.success) {
          router.push("/");
        } else {
          setError(result.error || "Invalid PIN");
          setPin("");
        }
      }
    } catch {
      setError("An unexpected error occurred");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login/auth");
  };

  const keypadLetters: Record<number, string> = {
    1: " ", 2: "ABC", 3: "DEF",
    4: "GHI", 5: "JKL", 6: "MNO",
    7: "PQRS", 8: "TUV", 9: "WXYZ", 0: "+",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 overflow-hidden relative">
      {/* Background Animated Gradient Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen" style={{ animation: 'pulse 8s infinite alternate' }} />

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs font-bold tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center z-10 p-8 rounded-[2.5rem] bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-[0_8px_40px_rgb(0,0,0,0.12)]">
        
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-4">
            <div className="absolute -inset-[3px] bg-primary/20 rounded-full blur-xs opacity-60" />
            <div className="relative w-20 h-20 rounded-full bg-black border border-white/20 overflow-hidden shadow-xl">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agentName)}`}
                alt="Agent Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {needsSetup ? "Create Your PIN" : `Welcome, ${agentName}`}
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            {needsSetup ? "Choose a 4-digit secure PIN for quick access." : "Enter your 4-digit secure PIN."}
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex flex-col items-center mb-10 w-full">
          <div className="flex justify-center gap-4 mb-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  pin.length > i 
                    ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] scale-110" 
                    : error
                      ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                      : "bg-white/10 border border-white/20 scale-100"
                } ${loading ? "animate-pulse" : ""}`}
              />
            ))}
          </div>
          {error && (
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest mt-2">
              {error}
            </span>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-5 w-full justify-items-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={loading}
              className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white text-xl font-bold hover:bg-white/10 hover:border-white/20 active:bg-primary/20 shadow-sm active:scale-95 transition-all duration-100 flex flex-col items-center justify-center relative select-none"
            >
              <span>{num}</span>
              <span className="text-[8px] font-bold text-gray-500 tracking-wider absolute bottom-2 uppercase">
                {keypadLetters[num]}
              </span>
            </button>
          ))}
          <div className="w-16 h-16" />
          <button
            onClick={() => handleNumberClick(0)}
            disabled={loading}
            className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white text-xl font-bold hover:bg-white/10 hover:border-white/20 active:bg-primary/20 shadow-sm active:scale-95 transition-all duration-100 flex flex-col items-center justify-center relative select-none"
          >
            <span>0</span>
            <span className="text-[8px] font-bold text-gray-500 tracking-wider absolute bottom-2 uppercase">
              {keypadLetters[0]}
            </span>
          </button>
          <button
            onClick={handleBackspace}
            disabled={loading || pin.length === 0}
            className="w-16 h-16 rounded-full bg-transparent hover:bg-white/5 active:bg-white/10 transition-all flex items-center justify-center text-gray-500 hover:text-white select-none disabled:opacity-30 active:scale-95 cursor-pointer border border-transparent"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
}
